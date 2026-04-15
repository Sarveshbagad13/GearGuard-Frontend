import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  User,
  Wrench,
} from 'lucide-react';
import { equipmentAPI, maintenanceRequestAPI, maintenanceRequestExtAPI, userAPI } from '../services/api';
import { getStoredUser } from '../utils/auth';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const initialForm = { title: '', equipmentId: '', type: 'preventive', date: '', startTime: '09:00', endTime: '10:00', technicianId: '', priority: 'medium', description: '' };

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const toTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const addHoursToTime = (time, hours = 1) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + Math.round(hours * 60);
  return `${String(Math.floor((total / 60) % 24)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const durationFromTimes = (start, end) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? Number((diff / 60).toFixed(2)) : null;
};

const combineDateAndTime = (date, time) => (date && time ? `${date}T${time}:00` : null);
const isSameDate = (a, b) => a.toDateString() === b.toDateString();

const mapRequestTypeToEventType = (type) => {
  switch ((type || '').toLowerCase()) {
    case 'preventive':
    case 'preventive maintenance':
      return 'preventive';
    case 'inspection':
      return 'inspection';
    case 'emergency':
      return 'emergency';
    default:
      return 'corrective';
  }
};

const mapEventTypeToRequestType = (type) => {
  switch (type) {
    case 'preventive':
      return 'Preventive';
    case 'inspection':
      return 'Inspection';
    case 'emergency':
      return 'Emergency';
    default:
      return 'Corrective';
  }
};

const mapStageToStatus = (stage) => {
  switch (stage) {
    case 'Repaired':
      return 'completed';
    case 'In Progress':
      return 'in-progress';
    case 'Scrap':
      return 'cancelled';
    default:
      return 'scheduled';
  }
};

const getStatusBadge = (status) => ({
  scheduled: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Scheduled' },
  'in-progress': { color: 'bg-blue-500/20 text-blue-400', label: 'In Progress' },
  completed: { color: 'bg-green-500/20 text-green-400', label: 'Completed' },
  cancelled: { color: 'bg-gray-500/20 text-gray-400', label: 'Cancelled' },
}[status] || { color: 'bg-yellow-500/20 text-yellow-400', label: 'Scheduled' });

const getTypeColor = (type) => ({
  preventive: 'bg-blue-500',
  corrective: 'bg-orange-500',
  inspection: 'bg-cyan-500',
  emergency: 'bg-red-500',
}[type] || 'bg-gray-500');

const getPriorityDot = (priority) => ({
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
}[priority] || 'bg-gray-500');

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterType, setFilterType] = useState('all');
  const [maintenanceEvents, setMaintenanceEvents] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventForm, setEventForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const mapRequestToEvent = (item) => {
    const scheduled = item.scheduledDate || item.requestDate;
    const startTime = toTimeInput(scheduled) || '09:00';
    const duration = item.duration ? Number(item.duration) : 1;
    return {
      id: item.id,
      requestNumber: item.requestNumber || `REQ-${String(item.id).padStart(3, '0')}`,
      title: item.subject || 'Untitled Maintenance',
      equipmentId: item.equipment?.id || item.equipmentId || '',
      equipmentName: item.equipment?.name || 'Unknown Equipment',
      type: mapRequestTypeToEventType(item.requestType),
      date: toDateInput(scheduled),
      startTime,
      endTime: addHoursToTime(startTime, duration),
      technicianId: item.assignedTo?.id || item.assignedToId || '',
      technician: item.assignedTo?.name || 'Unassigned',
      status: mapStageToStatus(item.stage),
      priority: (item.priority || 'Medium').toLowerCase(),
      description: item.description || '',
      location: item.equipment?.location || 'Location unavailable',
    };
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const start = new Date(year, month, 1, 0, 0, 0, 0).toISOString();
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
      let items = [];
      try {
        const response = await maintenanceRequestAPI.getCalendar(start, end);
        items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      } catch {
        const response = await maintenanceRequestAPI.getAll();
        const requests = Array.isArray(response?.data) ? response.data : [];
        items = requests.filter((item) => item.scheduledDate && new Date(item.scheduledDate) >= new Date(start) && new Date(item.scheduledDate) <= new Date(end));
      }
      setMaintenanceEvents(items.map(mapRequestToEvent));
    } catch (err) {
      console.error('Failed to load maintenance schedule:', err);
      setError(err.message || 'Failed to load maintenance schedule.');
      setMaintenanceEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const [equipmentResponse, technicianResponse] = await Promise.all([
        equipmentAPI.getAll().catch(() => ({ data: [] })),
        userAPI.getAll({ role: 'Technician' }).catch(() => ({ data: [] })),
      ]);
      setEquipmentOptions(Array.isArray(equipmentResponse?.data) ? equipmentResponse.data : []);
      setTechnicianOptions(Array.isArray(technicianResponse?.data) ? technicianResponse.data : []);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => { fetchOptions(); }, []);
  useEffect(() => { fetchEvents(); }, [year, month]);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i += 1) days.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) days.push(day);
    return days;
  }, [daysInMonth, startingDayOfWeek]);

  const getEventsForDate = (date) => {
    const dateStr = toDateInput(date);
    return maintenanceEvents
      .filter((event) => event.date === dateStr && (filterType === 'all' || event.type === filterType))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const selectedDateEvents = getEventsForDate(selectedDate);
  const selectedEquipment = equipmentOptions.find((item) => String(item.id) === String(eventForm.equipmentId));

  const stats = [
    { label: 'Today', value: getEventsForDate(new Date()).length, color: 'text-cyan-400' },
    { label: 'This Week', value: maintenanceEvents.filter((event) => {
      const eventDate = new Date(event.date);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate >= today && eventDate <= weekFromNow;
    }).length, color: 'text-blue-400' },
    { label: 'In Progress', value: maintenanceEvents.filter((event) => event.status === 'in-progress').length, color: 'text-orange-400' },
    { label: 'Completed', value: maintenanceEvents.filter((event) => event.status === 'completed').length, color: 'text-green-400' },
  ];

  const handleExport = () => {
    const headers = ['Request ID', 'Date', 'Start Time', 'End Time', 'Title', 'Equipment', 'Type', 'Technician', 'Status', 'Priority'];
    const rows = maintenanceEvents.map((event) => [event.requestNumber, event.date, event.startTime, event.endTime, event.title, event.equipmentName, event.type, event.technician, event.status, event.priority].map((field) => `"${String(field ?? '').replaceAll('"', '""')}"`).join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `maintenance-schedule-${toDateInput(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetForm = (date = selectedDate) => setEventForm({ ...initialForm, date: toDateInput(date) });
  const closeModal = () => { setShowEventModal(false); setIsEditMode(false); setEditingEventId(null); resetForm(); };
  const openCreateModal = () => { setIsEditMode(false); setEditingEventId(null); resetForm(); setShowEventModal(true); };
  const openEditModal = (event) => {
    setIsEditMode(true);
    setEditingEventId(event.id);
    setEventForm({ title: event.title, equipmentId: String(event.equipmentId || ''), type: event.type, date: event.date, startTime: event.startTime, endTime: event.endTime, technicianId: event.technicianId ? String(event.technicianId) : '', priority: event.priority, description: event.description });
    setShowEventModal(true);
  };

  const handleEventInputChange = (field, value) => setEventForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return alert('Please enter a title for the maintenance event.');
    if (!eventForm.equipmentId) return alert('Please select equipment.');
    const duration = durationFromTimes(eventForm.startTime, eventForm.endTime);
    if (!duration) return alert('End time must be later than start time.');
    const scheduledDate = combineDateAndTime(eventForm.date, eventForm.startTime);
    const currentUser = getStoredUser();
    const payload = {
      subject: eventForm.title.trim(),
      description: eventForm.description.trim(),
      equipment: Number(eventForm.equipmentId),
      requestType: mapEventTypeToRequestType(eventForm.type),
      priority: eventForm.priority.charAt(0).toUpperCase() + eventForm.priority.slice(1),
      scheduledDate,
      duration,
      assignedToId: eventForm.technicianId ? Number(eventForm.technicianId) : null,
      createdById: currentUser?.id ?? null,
    };

    try {
      setSubmitting(true);
      if (isEditMode && editingEventId) {
        await maintenanceRequestAPI.update(editingEventId, payload);
        if (eventForm.technicianId) {
          await maintenanceRequestExtAPI.assignTechnician(editingEventId, Number(eventForm.technicianId), scheduledDate);
        }
      } else {
        const response = await maintenanceRequestAPI.create(payload);
        const createdId = response?.data?.id;
        if (createdId && eventForm.technicianId) {
          await maintenanceRequestExtAPI.assignTechnician(createdId, Number(eventForm.technicianId), scheduledDate);
        }
      }
      await fetchEvents();
      closeModal();
    } catch (err) {
      console.error('Failed to save maintenance event:', err);
      alert(err.message || 'Failed to save maintenance event.');
    } finally {
      setSubmitting(false);
    }
  };

  const runEventAction = async (action) => {
    if (!selectedEvent) return;
    try {
      setActionSubmitting(true);
      await action();
      await fetchEvents();
      setSelectedEvent(null);
    } catch (err) {
      console.error('Calendar action failed:', err);
      alert(err.message || 'Calendar action failed.');
    } finally {
      setActionSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-cyan-400 text-lg">Loading maintenance schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">MAINTENANCE <span className="text-cyan-400">SCHEDULE</span></h1>
            <p className="text-gray-400">Plan, edit, complete, and remove scheduled maintenance work.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="px-4 py-2 border border-cyan-500/50 text-cyan-400 font-semibold text-sm uppercase tracking-wider hover:bg-cyan-500/10 transition-all flex items-center gap-2"><Download className="w-4 h-4" />Export</button>
            <button onClick={openCreateModal} className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold text-sm uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30"><Plus className="w-4 h-4" />New Event</button>
          </div>
        </div>

        {error && <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded p-4 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-yellow-400" /><p className="text-yellow-200">{error}</p></div>}
        {loadingOptions && <div className="mb-6 bg-cyan-500/10 border border-cyan-500/20 rounded p-4 flex items-center gap-3 text-sm text-cyan-200"><LoaderCircle className="w-4 h-4 animate-spin" />Loading equipment and technician options...</div>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => <div key={stat.label} className="bg-[#0f1729] border border-cyan-900/20 p-4 rounded-lg"><div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div><div className="text-gray-400 text-xs uppercase tracking-wider">{stat.label}</div></div>)}
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-[#0f1729] border border-cyan-900/20 rounded-lg p-4 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-cyan-500/10 rounded"><ChevronLeft className="w-5 h-5 text-cyan-400" /></button>
                <h3 className="font-bold text-white">{monthNames[month]} {year}</h3>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-cyan-500/10 rounded"><ChevronRight className="w-5 h-5 text-cyan-400" /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map((day) => <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">{day}</div>)}
                {calendarDays.map((day, index) => {
                  if (day === null) return <div key={`empty-${index}`} />;
                  const date = new Date(year, month, day);
                  const selected = isSameDate(date, selectedDate);
                  const today = isSameDate(date, new Date());
                  const hasEvents = maintenanceEvents.some((event) => event.date === toDateInput(date));
                  return <button key={day} onClick={() => setSelectedDate(date)} className={`aspect-square flex items-center justify-center text-sm rounded relative ${selected ? 'bg-cyan-500 text-[#0a0e1a] font-bold' : ''} ${!selected && today ? 'border-2 border-cyan-500 text-cyan-400 font-bold' : ''} ${!selected && !today ? 'text-gray-400 hover:bg-cyan-500/10' : ''}`}>{day}{hasEvents && !selected && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full" />}</button>;
                })}
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase mb-2 block">Filter Type</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-[#1a1f35] border border-cyan-900/20 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50">
                  <option value="all">All Types</option><option value="preventive">Preventive</option><option value="corrective">Corrective</option><option value="inspection">Inspection</option><option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <div className="bg-[#0f1729] border border-cyan-900/20 rounded-lg">
              <div className="p-6 border-b border-cyan-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{dayNamesFull[selectedDate.getDay()]}, {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}</h2>
                    <p className="text-sm text-gray-400">{selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled</p>
                  </div>
                  {isSameDate(selectedDate, new Date()) && <div className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold border border-cyan-500/50">TODAY</div>}
                </div>
              </div>
              <div className="p-6">
                {selectedDateEvents.length === 0 ? <div className="text-center py-12"><div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><CalendarDays className="w-8 h-8 text-cyan-400" /></div><h3 className="text-lg font-semibold text-gray-400 mb-2">No Events Scheduled</h3><p className="text-sm text-gray-600">No maintenance activities planned for this date.</p></div> : <div className="space-y-3">{selectedDateEvents.map((event) => { const status = getStatusBadge(event.status); return <div key={event.id} className="group relative"><div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${getTypeColor(event.type)}`} /><div className="ml-6 bg-[#1a1f35] border border-cyan-900/20 rounded-lg p-4 hover:border-cyan-500/50 transition-all cursor-pointer" onClick={() => setSelectedEvent(event)}><div className="flex items-start justify-between mb-3 gap-4"><div className="flex-1"><div className="flex items-center gap-2 mb-2"><span className="text-cyan-400 font-mono text-sm font-semibold">{event.startTime} - {event.endTime}</span><div className={`w-2 h-2 rounded-full ${getPriorityDot(event.priority)}`} /></div><h4 className="text-white font-bold text-lg mb-1">{event.title}</h4><p className="text-gray-400 text-sm">{event.description || 'No additional description provided.'}</p></div><div className={`px-3 py-1 rounded ${status.color} text-xs font-semibold uppercase`}>{status.label}</div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"><div className="flex items-center gap-2 text-gray-400"><Wrench className="w-4 h-4" /><span>{event.equipmentName}</span></div><div className="flex items-center gap-2 text-gray-400"><User className="w-4 h-4" /><span>{event.technician}</span></div><div className="flex items-center gap-2 text-gray-400"><MapPin className="w-4 h-4" /><span>{event.location}</span></div></div></div></div>; })}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setSelectedEvent(null)}>
          <div className="bg-[#0f1729] border border-cyan-500/30 rounded-lg max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div><h2 className="text-2xl font-bold text-white mb-1">{selectedEvent.title}</h2><p className="text-gray-400">{selectedEvent.date} · {selectedEvent.startTime} - {selectedEvent.endTime}</p></div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-white transition-colors text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2"><div className={`px-3 py-1 rounded ${getTypeColor(selectedEvent.type)} text-white text-sm font-semibold`}>{selectedEvent.type}</div><div className={`px-3 py-1 rounded ${getStatusBadge(selectedEvent.status).color} text-sm font-semibold`}>{getStatusBadge(selectedEvent.status).label}</div><div className="flex items-center gap-2 px-3 py-1 rounded bg-gray-700/50 text-sm"><div className={`w-2 h-2 rounded-full ${getPriorityDot(selectedEvent.priority)}`} /><span className="text-white capitalize">{selectedEvent.priority} Priority</span></div></div>
              <div className="grid grid-cols-2 gap-4"><div><div className="text-xs text-gray-500 uppercase mb-1">Equipment</div><div className="text-white font-semibold">{selectedEvent.equipmentName}</div><div className="text-xs text-gray-500">{selectedEvent.requestNumber}</div></div><div><div className="text-xs text-gray-500 uppercase mb-1">Location</div><div className="text-white">{selectedEvent.location}</div></div><div><div className="text-xs text-gray-500 uppercase mb-1">Assigned Technician</div><div className="text-white">{selectedEvent.technician}</div></div><div><div className="text-xs text-gray-500 uppercase mb-1">Duration</div><div className="text-white">{durationFromTimes(selectedEvent.startTime, selectedEvent.endTime)} hour(s)</div></div></div>
              <div><div className="text-xs text-gray-500 uppercase mb-2">Description</div><div className="bg-[#1a1f35] rounded p-4 text-gray-300">{selectedEvent.description || 'No additional description provided.'}</div></div>
              <div className="flex flex-wrap gap-3 pt-4">
                <button type="button" onClick={() => { openEditModal(selectedEvent); setSelectedEvent(null); }} disabled={actionSubmitting} className="flex-1 min-w-[150px] px-4 py-3 bg-cyan-500 text-[#0a0e1a] font-bold uppercase hover:bg-cyan-400 transition-all disabled:opacity-50"><span className="inline-flex items-center gap-2"><Pencil className="w-4 h-4" />Edit Event</span></button>
                {selectedEvent.status === 'scheduled' && <button type="button" onClick={() => runEventAction(() => maintenanceRequestExtAPI.startWork(selectedEvent.id))} disabled={actionSubmitting} className="flex-1 min-w-[150px] px-4 py-3 border border-blue-500 text-blue-300 font-bold uppercase hover:bg-blue-500/10 transition-all disabled:opacity-50">Start Work</button>}
                {selectedEvent.status !== 'completed' && selectedEvent.status !== 'cancelled' && <button type="button" onClick={() => runEventAction(() => maintenanceRequestExtAPI.completeRequest(selectedEvent.id, 0, 'Completed from maintenance schedule'))} disabled={actionSubmitting} className="flex-1 min-w-[150px] px-4 py-3 border border-cyan-500 text-cyan-400 font-bold uppercase hover:bg-cyan-500/10 transition-all disabled:opacity-50">Mark Complete</button>}
                <button type="button" onClick={() => { if (window.confirm(`Delete "${selectedEvent.title}" from the maintenance schedule?`)) runEventAction(() => maintenanceRequestAPI.delete(selectedEvent.id)); }} disabled={actionSubmitting} className="px-4 py-3 border border-red-500 text-red-400 font-bold uppercase hover:bg-red-500/10 transition-all disabled:opacity-50"><span className="inline-flex items-center gap-2"><Trash2 className="w-4 h-4" />Delete</span></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={closeModal}>
          <div className="bg-[#0f1729] border border-cyan-500/30 rounded-lg max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div><h2 className="text-2xl font-bold text-white mb-1">{isEditMode ? 'Edit Maintenance Event' : 'Schedule Maintenance'}</h2><p className="text-gray-400">{isEditMode ? 'Update the scheduled work order details.' : 'Create a new maintenance event backed by the live request system.'}</p></div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors text-2xl">×</button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div><label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Title</label><input type="text" value={eventForm.title} onChange={(e) => handleEventInputChange('title', e.target.value)} className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50" placeholder="Brief description of maintenance" required /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Equipment</label><select value={eventForm.equipmentId} onChange={(e) => handleEventInputChange('equipmentId', e.target.value)} className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50" required><option value="">Select Equipment</option>{equipmentOptions.map((equipment) => <option key={equipment.id} value={equipment.id}>{equipment.name} {equipment.serialNumber ? `(${equipment.serialNumber})` : ''}</option>)}</select></div>
                <div><label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Type</label><select value={eventForm.type} onChange={(e) => handleEventInputChange('type', e.target.value)} className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"><option value="preventive">Preventive</option><option value="corrective">Corrective</option><option value="inspection">Inspection</option><option value="emergency">Emergency</option></select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Date</label><input type="date" value={eventForm.date} onChange={(e) => handleEventInputChange('date', e.target.value)} className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50" required /></div>
                <div><label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Start Time</label><input type="time" value={eventForm.startTime} onChange={(e) => handleEventInputChange('startTime', e.target.value)} className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50" required /></div>
                <div><label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">End Time</label><input type="time" value={eventForm.endTime} onChange={(e) => handleEventInputChange('endTime', e.target.value)} className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50" required /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Technician</label><select value={eventForm.technicianId} onChange={(e) => handleEventInputChange('technicianId', e.target.value)} className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"><option value="">Unassigned</option>{technicianOptions.map((technician) => <option key={technician.id} value={technician.id}>{technician.name}</option>)}</select></div>
                <div><label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Priority</label><select value={eventForm.priority} onChange={(e) => handleEventInputChange('priority', e.target.value)} className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
              </div>
              <div><label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Description</label><textarea rows="3" value={eventForm.description} onChange={(e) => handleEventInputChange('description', e.target.value)} className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50" placeholder="Detailed description..." /></div>
              {selectedEquipment && <div className="bg-cyan-500/5 border border-cyan-500/20 rounded p-3 text-sm text-gray-300">Scheduled location: <span className="text-cyan-300">{selectedEquipment.location || 'Location unavailable'}</span></div>}
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={submitting} className="flex-1 px-6 py-3 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all disabled:opacity-50">{submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Event'}</button>
                <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 border border-cyan-500 text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500/10 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
