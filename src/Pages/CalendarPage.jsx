import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Download, MapPin, User, Wrench, AlertCircle } from 'lucide-react';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Sample maintenance events
  const [maintenanceEvents, setMaintenanceEvents] = useState([
    {
      id: 'EV-001',
      title: 'CNC Machine A1 - Scheduled Maintenance',
      equipmentId: 'EQ-001',
      equipmentName: 'CNC Machine A1',
      type: 'preventive',
      date: '2026-02-15',
      startTime: '09:00',
      endTime: '13:00',
      technician: 'Mike Johnson',
      status: 'scheduled',
      priority: 'medium',
      description: 'Regular quarterly maintenance check',
      location: 'Floor 2 - Bay 3',
    },
    {
      id: 'EV-002',
      title: 'Forklift FL-205 - Oil Change',
      equipmentId: 'EQ-002',
      equipmentName: 'Forklift FL-205',
      type: 'preventive',
      date: '2026-02-16',
      startTime: '14:00',
      endTime: '16:00',
      technician: 'Tom Wilson',
      status: 'scheduled',
      priority: 'low',
      description: 'Monthly oil change and filter replacement',
      location: 'Warehouse A',
    },
    {
      id: 'EV-003',
      title: 'Server Rack SR-12 - Emergency Repair',
      equipmentId: 'EQ-003',
      equipmentName: 'Server Rack SR-12',
      type: 'corrective',
      date: '2026-02-15',
      startTime: '10:00',
      endTime: '11:00',
      technician: 'Alex Chen',
      status: 'completed',
      priority: 'critical',
      description: 'Cooling fan replacement - urgent',
      location: 'Data Center - Row 5',
    },
    {
      id: 'EV-004',
      title: 'HVAC Unit H-8 - Filter Replacement',
      equipmentId: 'EQ-004',
      equipmentName: 'HVAC Unit H-8',
      type: 'preventive',
      date: '2026-02-20',
      startTime: '11:00',
      endTime: '11:30',
      technician: 'Robert Lee',
      status: 'scheduled',
      priority: 'low',
      description: 'Quarterly filter replacement',
      location: 'Building C - Roof',
    },
    {
      id: 'EV-005',
      title: 'Delivery Van DV-03 - Brake Service',
      equipmentId: 'EQ-005',
      equipmentName: 'Delivery Van DV-03',
      type: 'corrective',
      date: '2024-02-18',
      startTime: '08:00',
      endTime: '11:00',
      technician: 'Tom Wilson',
      status: 'in-progress',
      priority: 'high',
      description: 'Brake pad replacement and system check',
      location: 'Parking Lot B',
    },
    {
      id: 'EV-006',
      title: 'Conveyor Belt CB-7 - Motor Replacement',
      equipmentId: 'EQ-006',
      equipmentName: 'Conveyor Belt CB-7',
      type: 'corrective',
      date: '2024-02-15',
      startTime: '06:00',
      endTime: '12:00',
      technician: 'Emergency Team',
      status: 'in-progress',
      priority: 'critical',
      description: 'Emergency motor replacement',
      location: 'Floor 1 - Assembly',
    },
  ]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getTypeColor = (type) => {
    const colors = {
      preventive: 'bg-blue-500',
      corrective: 'bg-orange-500',
      inspection: 'bg-cyan-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const getStatusBadge = (status) => {
    const config = {
      scheduled: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Scheduled' },
      'in-progress': { color: 'bg-blue-500/20 text-blue-400', label: 'In Progress' },
      completed: { color: 'bg-green-500/20 text-green-400', label: 'Completed' },
    };
    return config[status] || config.scheduled;
  };

  const getPriorityDot = (priority) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
    };
    return colors[priority] || 'bg-gray-500';
  };

  // Mini calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const hasEventsOnDate = (day) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return maintenanceEvents.some(e => e.date === dateStr);
  };

  const isSameDate = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isToday = (day) => {
    const date = new Date(year, month, day);
    return isSameDate(date, new Date());
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return maintenanceEvents
      .filter(event => {
        const matchesDate = event.date === dateStr;
        const matchesFilter = filterType === 'all' || event.type === filterType;
        return matchesDate && matchesFilter;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const stats = [
    { label: 'Today', value: getEventsForDate(new Date()).length, color: 'text-cyan-400' },
    { label: 'This Week', value: maintenanceEvents.filter(e => {
      const eventDate = new Date(e.date);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate >= today && eventDate <= weekFromNow;
    }).length, color: 'text-blue-400' },
    { label: 'In Progress', value: maintenanceEvents.filter(e => e.status === 'in-progress').length, color: 'text-orange-400' },
    { label: 'Completed', value: maintenanceEvents.filter(e => e.status === 'completed').length, color: 'text-green-400' },
  ];

  const handleExport = () => {
    const headers = ['Date', 'Start Time', 'End Time', 'Title', 'Equipment', 'Type', 'Technician', 'Status', 'Priority'];
    const csvRows = maintenanceEvents.map(event => [
      event.date,
      event.startTime,
      event.endTime,
      event.title,
      event.equipmentName,
      event.type,
      event.technician,
      event.status,
      event.priority
    ].map(field => `"${field}"`).join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `maintenance-schedule-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              MAINTENANCE <span className="text-cyan-400">SCHEDULE</span>
            </h1>
            <p className="text-gray-400">Plan and track maintenance activities</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="px-4 py-2 border border-cyan-500/50 text-cyan-400 font-semibold text-sm uppercase tracking-wider hover:bg-cyan-500/10 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => setShowEventModal(true)}
              className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold text-sm uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-[#0f1729] border border-cyan-900/20 p-4 rounded-lg">
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-gray-400 text-xs uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Layout: Sidebar + Agenda */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Mini Calendar */}
          <div className="col-span-3">
            <div className="bg-[#0f1729] border border-cyan-900/20 rounded-lg p-4 sticky top-6">
              {/* Mini Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={previousMonth} className="p-1 hover:bg-cyan-500/10 rounded">
                  <ChevronLeft className="w-5 h-5 text-cyan-400" />
                </button>
                <h3 className="font-bold text-white">
                  {monthNames[month]} {year}
                </h3>
                <button onClick={nextMonth} className="p-1 hover:bg-cyan-500/10 rounded">
                  <ChevronRight className="w-5 h-5 text-cyan-400" />
                </button>
              </div>

              {/* Mini Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} />;
                  }

                  const date = new Date(year, month, day);
                  const selected = isSameDate(date, selectedDate);
                  const today = isToday(day);
                  const hasEvents = hasEventsOnDate(day);

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        aspect-square flex items-center justify-center text-sm rounded relative
                        ${selected ? 'bg-cyan-500 text-[#0a0e1a] font-bold' : ''}
                        ${!selected && today ? 'border-2 border-cyan-500 text-cyan-400 font-bold' : ''}
                        ${!selected && !today ? 'text-gray-400 hover:bg-cyan-500/10' : ''}
                      `}
                    >
                      {day}
                      {hasEvents && !selected && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Filter */}
              <div>
                <label className="text-xs text-gray-500 uppercase mb-2 block">Filter Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-[#1a1f35] border border-cyan-900/20 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="all">All Types</option>
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="inspection">Inspection</option>
                </select>
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t border-cyan-900/20">
                <div className="text-xs text-gray-500 uppercase mb-3">Event Types</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-xs text-gray-400">Preventive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500" />
                    <span className="text-xs text-gray-400">Corrective</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-cyan-500" />
                    <span className="text-xs text-gray-400">Inspection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Agenda View */}
          <div className="col-span-9">
            <div className="bg-[#0f1729] border border-cyan-900/20 rounded-lg">
              {/* Agenda Header */}
              <div className="p-6 border-b border-cyan-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {dayNamesFull[selectedDate.getDay()]}, {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
                    </p>
                  </div>
                  {isSameDate(selectedDate, new Date()) && (
                    <div className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold border border-cyan-500/50">
                      TODAY
                    </div>
                  )}
                </div>
              </div>

              {/* Events List */}
              <div className="p-6">
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No Events Scheduled</h3>
                    <p className="text-sm text-gray-600">No maintenance activities planned for this date</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => {
                      const statusConfig = getStatusBadge(event.status);
                      
                      return (
                        <div
                          key={event.id}
                          className="group relative"
                        >
                          {/* Time indicator line */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${getTypeColor(event.type)}`} />
                          
                          <div 
                            className="ml-6 bg-[#1a1f35] border border-cyan-900/20 rounded-lg p-4 hover:border-cyan-500/50 transition-all cursor-pointer"
                            onClick={() => setSelectedEvent(event)}
                          >
                            {/* Event Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-cyan-400 font-mono text-sm font-semibold">
                                    {event.startTime} - {event.endTime}
                                  </span>
                                  <div className={`w-2 h-2 rounded-full ${getPriorityDot(event.priority)}`} />
                                </div>
                                <h4 className="text-white font-bold text-lg mb-1">{event.title}</h4>
                                <p className="text-gray-400 text-sm">{event.description}</p>
                              </div>
                              
                              <div className={`px-3 py-1 rounded ${statusConfig.color} text-xs font-semibold uppercase`}>
                                {statusConfig.label}
                              </div>
                            </div>

                            {/* Event Details */}
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-400">
                                <Wrench className="w-4 h-4" />
                                <span>{event.equipmentName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-400">
                                <User className="w-4 h-4" />
                                <span>{event.technician}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setSelectedEvent(null)}>
          <div className="bg-[#0f1729] border border-cyan-500/30 rounded-lg max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedEvent.title}</h2>
                <p className="text-gray-400">{selectedEvent.date} • {selectedEvent.startTime} - {selectedEvent.endTime}</p>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className={`px-3 py-1 rounded ${getTypeColor(selectedEvent.type)} text-white text-sm font-semibold`}>
                  {selectedEvent.type}
                </div>
                <div className={`px-3 py-1 rounded ${getStatusBadge(selectedEvent.status).color} text-sm font-semibold`}>
                  {selectedEvent.status}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-gray-700/50 text-sm">
                  <div className={`w-2 h-2 rounded-full ${getPriorityDot(selectedEvent.priority)}`} />
                  <span className="text-white capitalize">{selectedEvent.priority} Priority</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Equipment</div>
                  <div className="text-white font-semibold">{selectedEvent.equipmentName}</div>
                  <div className="text-xs text-gray-500">{selectedEvent.equipmentId}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Location</div>
                  <div className="text-white">{selectedEvent.location}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Assigned Technician</div>
                  <div className="text-white">{selectedEvent.technician}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Duration</div>
                  <div className="text-white">
                    {(() => {
                      const start = selectedEvent.startTime.split(':');
                      const end = selectedEvent.endTime.split(':');
                      const duration = (parseInt(end[0]) - parseInt(start[0])) + (parseInt(end[1]) - parseInt(start[1])) / 60;
                      return `${duration} hour${duration !== 1 ? 's' : ''}`;
                    })()}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase mb-2">Description</div>
                <div className="bg-[#1a1f35] rounded p-4 text-gray-300">
                  {selectedEvent.description}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-3 bg-cyan-500 text-[#0a0e1a] font-bold uppercase hover:bg-cyan-400 transition-all">
                  Edit Event
                </button>
                <button className="flex-1 px-4 py-3 border border-cyan-500 text-cyan-400 font-bold uppercase hover:bg-cyan-500/10 transition-all">
                  Mark Complete
                </button>
                <button className="px-4 py-3 border border-red-500 text-red-400 font-bold uppercase hover:bg-red-500/10 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal - same as before */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setShowEventModal(false)}>
          <div className="bg-[#0f1729] border border-cyan-500/30 rounded-lg max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Schedule Maintenance</h2>
                <p className="text-gray-400">Create a new maintenance event</p>
              </div>
              <button 
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Title</label>
                <input
                  type="text"
                  className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Brief description of maintenance"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Equipment</label>
                  <select className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50">
                    <option>Select Equipment</option>
                    <option>CNC Machine A1</option>
                    <option>Forklift FL-205</option>
                    <option>Server Rack SR-12</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Type</label>
                  <select className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50">
                    <option value="preventive">Preventive</option>
                    <option value="corrective">Corrective</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Date</label>
                  <input
                    type="date"
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Start Time</label>
                  <input
                    type="time"
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">End Time</label>
                  <input
                    type="time"
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Technician</label>
                  <select className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50">
                    <option>Select Technician</option>
                    <option>Mike Johnson</option>
                    <option>Tom Wilson</option>
                    <option>Alex Chen</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Priority</label>
                  <select className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                  rows="3"
                  className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Detailed description..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all"
                >
                  Create Event
                </button>
                <button 
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 px-6 py-3 border border-cyan-500 text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;