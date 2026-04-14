import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Download, Upload, MoreVertical, AlertTriangle, CheckCircle2, Clock, User, Wrench, XCircle, AlertCircle } from 'lucide-react';
import { maintenanceRequestAPI, equipmentAPI, userAPI } from '../services/api';
import { getStoredUser, normalizeRole } from '../utils/auth';
import { hasPermission } from '../utils/rolePermissions';

const RequestsPage = () => {
  const currentUser = getStoredUser();
  const currentRole = normalizeRole(currentUser?.role);
  const canCreateRequest = hasPermission(currentRole, 'CREATE_REQUEST');
  const canAssignTechnician = hasPermission(currentRole, 'ASSIGN_TECHNICIAN');
  const canUpdateRequestStatus = hasPermission(currentRole, 'UPDATE_REQUEST_STATUS');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [requestsData, setRequestsData] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [newRequestForm, setNewRequestForm] = useState({
    title: '',
    equipmentId: '',
    priority: 'Medium',
    category: 'Repair',
    dueDate: '',
    description: ''
  });

  // Fetch maintenance requests from API
  useEffect(() => {
    fetchRequests();
    fetchEquipmentOptions();
    fetchTechnicianOptions();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      setSelectedTechnicianId(selectedRequest.rawData?.assignedToId ? String(selectedRequest.rawData.assignedToId) : '');
      setSelectedStatus(selectedRequest.status || 'pending');
    } else {
      setSelectedTechnicianId('');
      setSelectedStatus('pending');
    }
  }, [selectedRequest]);

  const mapRequestItem = (item) => ({
    id: item.requestNumber || `REQ-${String(item.id).padStart(3, '0')}`,
    title: item.subject,
    equipmentId: item.equipmentId ? `EQ-${String(item.equipmentId).padStart(3, '0')}` : 'N/A',
    equipmentName: item.equipment?.name || 'Unknown Equipment',
    location: item.equipment?.location || 'N/A',
    requestedBy: item.createdBy?.name || 'Unknown',
    assignedTo: item.assignedTo?.name || 'Unassigned',
    priority: mapBackendPriority(item.priority),
    status: mapBackendStage(item.stage),
    category: item.requestType,
    description: item.description || '',
    createdDate: new Date(item.requestDate).toISOString().split('T')[0],
    dueDate: item.scheduledDate ? new Date(item.scheduledDate).toISOString().split('T')[0] : 'TBD',
    completedDate: item.completedDate ? new Date(item.completedDate).toISOString().split('T')[0] : null,
    estimatedTime: item.duration ? `${item.duration} hours` : 'N/A',
    rawData: item
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await maintenanceRequestAPI.getAll();
      const mappedData = response.data.map(mapRequestItem);
      const scopedData =
        currentRole === 'Technician'
          ? mappedData.filter((item) => item.rawData?.assignedTo?.id === currentUser?.id || item.rawData?.assignedToId === currentUser?.id)
          : currentRole === 'User'
          ? mappedData.filter((item) => item.rawData?.createdBy?.id === currentUser?.id || item.rawData?.createdById === currentUser?.id)
          : mappedData;
      
      setRequestsData(scopedData);
    } catch (err) {
      console.error('Failed to fetch maintenance requests:', err);
      setError(err.message || 'Failed to load maintenance requests.');
      setRequestsData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipmentOptions = async () => {
    try {
      const response = await equipmentAPI.getAll();
      const options = Array.isArray(response?.data)
        ? response.data.map(item => ({
            id: item.id,
            name: item.name,
            serialNumber: item.serialNumber
          }))
        : [];
      setEquipmentOptions(options);
    } catch (err) {
      console.error('Failed to fetch equipment options:', err);
      // Keep form usable with no options instead of breaking the page.
      setEquipmentOptions([]);
    }
  };

  const fetchTechnicianOptions = async () => {
    try {
      const response = await userAPI.getAll({ role: 'Technician' });
      setTechnicianOptions(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch technician options:', err);
      setTechnicianOptions([]);
    }
  };

  const mapCategoryToRequestType = (category) => {
    const categoryMap = {
      'Repair': 'Corrective',
      'Preventive Maintenance': 'Preventive',
      'Emergency': 'Emergency',
      'Inspection': 'Inspection',
    };

    return categoryMap[category] || 'Corrective';
  };

  const handleCreateInputChange = (field, value) => {
    setNewRequestForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetCreateForm = () => {
    setNewRequestForm({
      title: '',
      equipmentId: '',
      priority: 'Medium',
      category: 'Repair',
      dueDate: '',
      description: ''
    });
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    if (!newRequestForm.title.trim()) {
      alert('Please enter a title for the request.');
      return;
    }

    if (!newRequestForm.equipmentId) {
      alert('Please select equipment.');
      return;
    }

    try {
      setIsSubmitting(true);
      const currentUser = getStoredUser();

      const payload = {
        subject: newRequestForm.title.trim(),
        description: newRequestForm.description.trim(),
        equipment: Number(newRequestForm.equipmentId),
        requestType: mapCategoryToRequestType(newRequestForm.category),
        priority: newRequestForm.priority,
        scheduledDate: newRequestForm.dueDate || null,
        createdById: currentUser?.id ?? null
      };

      await maintenanceRequestAPI.create(payload);
      await fetchRequests();

      setShowCreateModal(false);
      resetCreateForm();
    } catch (err) {
      console.error('Failed to create maintenance request:', err);
      alert(`Failed to create request: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAssignableTechnicians = () => {
    if (!selectedRequest?.rawData?.maintenanceTeamId) {
      return technicianOptions;
    }

    const filtered = technicianOptions.filter(
      (technician) =>
        technician.teamId === selectedRequest.rawData.maintenanceTeamId ||
        technician.id === selectedRequest.rawData.assignedToId
    );

    return filtered.length > 0 ? filtered : technicianOptions;
  };

  const handleAssignTechnician = async () => {
    if (!selectedRequest || !selectedTechnicianId) {
      alert('Please select a technician first.');
      return;
    }

    try {
      setAssignmentSubmitting(true);
      const response = await maintenanceRequestAPI.update(selectedRequest.rawData.id, {
        assignedToId: Number(selectedTechnicianId)
      });

      const updatedRequest = mapRequestItem(response.data);
      setRequestsData((prev) =>
        prev.map((request) => (request.rawData.id === selectedRequest.rawData.id ? updatedRequest : request))
      );
      setSelectedRequest(updatedRequest);
      alert('Technician assigned successfully!');
    } catch (err) {
      console.error('Failed to assign technician:', err);
      alert(err.message || 'Failed to assign technician');
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  // Helper function to map backend priority to frontend
  const mapBackendPriority = (priority) => {
    if (!priority) return 'medium';
    return priority.toLowerCase();
  };

  // Helper function to map backend stage to frontend status
  const mapBackendStage = (stage) => {
    const stageMap = {
      'New': 'pending',
      'In Progress': 'in-progress',
      'Repaired': 'completed',
      'Scrap': 'cancelled'
    };
    return stageMap[stage] || 'pending';
  };

  const mapFrontendStatusToBackendStage = (status) => {
    const statusMap = {
      pending: 'New',
      'in-progress': 'In Progress',
      completed: 'Repaired',
      cancelled: 'Scrap',
    };
    return statusMap[status] || 'New';
  };

  const handleUpdateRequestStatus = async (statusOverride) => {
    const nextStatus = statusOverride || selectedStatus;

    if (!selectedRequest?.rawData?.id) {
      alert('Status updates are unavailable while the page is showing sample request data.');
      return;
    }

    try {
      setStatusSubmitting(true);
      const response = await maintenanceRequestAPI.updateStage(
        selectedRequest.rawData.id,
        mapFrontendStatusToBackendStage(nextStatus)
      );

      const updatedRequest = mapRequestItem(response.data);
      setRequestsData((prev) =>
        prev.map((request) => (request.rawData.id === selectedRequest.rawData.id ? updatedRequest : request))
      );
      setSelectedRequest(updatedRequest);
      setSelectedStatus(updatedRequest.status);
      alert(`Request status updated to ${getStatusLabel(updatedRequest.status)}.`);
    } catch (err) {
      console.error('Failed to update request status:', err);
      alert(err.message || 'Failed to update request status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!selectedRequest) return;

    if (!window.confirm(`Cancel request "${selectedRequest.id}"?`)) {
      return;
    }

    await handleUpdateRequestStatus('cancelled');
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      critical: { color: 'bg-red-500/20 text-red-400 border-red-500/50', label: 'Critical' },
      high: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/50', label: 'High' },
      medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', label: 'Medium' },
      low: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', label: 'Low' },
    };

    const config = priorityConfig[priority];

    return (
      <span className={`px-2 py-1 rounded border ${config.color} text-xs font-semibold uppercase`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: Clock, label: 'Pending' },
      'in-progress': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', icon: Wrench, label: 'In Progress' },
      completed: { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: CheckCircle2, label: 'Completed' },
      cancelled: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/50', icon: XCircle, label: 'Cancelled' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded border ${config.color} text-xs font-semibold uppercase flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || 'Pending';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Repair': 'text-orange-400',
      'Preventive Maintenance': 'text-blue-400',
      'Emergency': 'text-red-400',
      'Inspection': 'text-cyan-400',
    };
    return colors[category] || 'text-gray-400';
  };

  const filteredRequests = requestsData.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = [
    { label: 'Total Requests', value: requestsData.length, color: 'text-cyan-400' },
    { label: 'Pending', value: requestsData.filter(r => r.status === 'pending').length, color: 'text-yellow-400' },
    { label: 'In Progress', value: requestsData.filter(r => r.status === 'in-progress').length, color: 'text-blue-400' },
    { label: 'Critical', value: requestsData.filter(r => r.priority === 'critical').length, color: 'text-red-400' },
  ];

  // Export functionality
  const handleExport = () => {
    const headers = [
      'Request ID',
      'Title',
      'Equipment',
      'Location',
      'Requested By',
      'Assigned To',
      'Priority',
      'Status',
      'Category',
      'Created Date',
      'Due Date',
      'Estimated Time'
    ];

    const csvRows = requestsData.map(req => [
      req.id,
      req.title,
      req.equipmentName,
      req.location,
      req.requestedBy,
      req.assignedTo,
      req.priority,
      req.status,
      req.category,
      req.createdDate,
      req.dueDate,
      req.estimatedTime
    ].map(field => `"${field}"`).join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `maintenance-requests-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Successfully exported ${requestsData.length} maintenance requests!`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              MAINTENANCE <span className="text-cyan-400">REQUESTS</span>
            </h1>
            <p className="text-gray-400">Track and manage all maintenance work orders</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="px-4 py-2 border border-cyan-500/50 text-cyan-400 font-semibold text-sm uppercase tracking-wider hover:bg-cyan-500/10 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {canCreateRequest && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold text-sm uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30"
              >
                <Plus className="w-4 h-4" />
                New Request
              </button>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-200">{error}</p>
          </div>
        )}

        {equipmentOptions.length === 0 && (
          <div className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <p className="text-orange-200">
              No equipment is available yet. Create equipment first before submitting maintenance requests.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-[#0f1729] border border-cyan-900/20 p-4 rounded">
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requests by title, equipment, ID, or requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1729] border border-cyan-900/20 rounded px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-white rounded focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-white rounded focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-[#0f1729] border border-cyan-900/20 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35] border-b border-cyan-900/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Request ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-900/20">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No maintenance requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr 
                      key={request.id}
                      className="hover:bg-[#1a1f35] transition-colors cursor-pointer"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-cyan-400">{request.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-white">{request.title}</div>
                        <div className={`text-xs ${getCategoryColor(request.category)}`}>{request.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{request.equipmentName}</div>
                        <div className="text-xs text-gray-500">{request.location}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getPriorityBadge(request.priority)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {request.assignedTo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {request.dueDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-gray-400 hover:text-cyan-400 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Showing {filteredRequests.length} of {requestsData.length} requests
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-gray-400 rounded hover:border-cyan-500/50 transition-all">
              Previous
            </button>
            <button className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] rounded font-semibold">
              1
            </button>
            <button className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-gray-400 rounded hover:border-cyan-500/50 transition-all">
              2
            </button>
            <button className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-gray-400 rounded hover:border-cyan-500/50 transition-all">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setSelectedRequest(null)}>
          <div className="bg-[#0f1729] border border-cyan-500/30 rounded-lg max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedRequest.title}</h2>
                <p className="text-cyan-400 font-mono">{selectedRequest.id}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Equipment</div>
                <div className="text-white font-semibold">{selectedRequest.equipmentName}</div>
                <div className="text-xs text-cyan-400">{selectedRequest.equipmentId}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</div>
                <div className="text-white">{selectedRequest.location}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Requested By</div>
                <div className="text-white">{selectedRequest.requestedBy}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Assigned To</div>
                <div className="text-white">{selectedRequest.assignedTo}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Priority</div>
                {getPriorityBadge(selectedRequest.priority)}
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</div>
                {getStatusBadge(selectedRequest.status)}
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Category</div>
                <div className={`${getCategoryColor(selectedRequest.category)} font-semibold`}>{selectedRequest.category}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Estimated Time</div>
                <div className="text-white">{selectedRequest.estimatedTime}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created Date</div>
                <div className="text-white">{selectedRequest.createdDate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Due Date</div>
                <div className="text-white">{selectedRequest.dueDate}</div>
              </div>
              {selectedRequest.completedDate && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Completed Date</div>
                  <div className="text-green-400">{selectedRequest.completedDate}</div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Description</div>
              <div className="bg-[#1a1f35] border border-cyan-900/20 rounded p-4 text-gray-300 leading-relaxed">
                {selectedRequest.description}
              </div>
            </div>

            {canAssignTechnician && (
              <div className="mb-6">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Assign Technician</div>
                <div className="flex gap-3">
                  <select
                    value={selectedTechnicianId}
                    onChange={(e) => setSelectedTechnicianId(e.target.value)}
                    disabled={assignmentSubmitting}
                    className="flex-1 bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">Select technician</option>
                    {getAssignableTechnicians().map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.name} {technician.team?.name ? `- ${technician.team.name}` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssignTechnician}
                    disabled={assignmentSubmitting || !selectedTechnicianId}
                    className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assignmentSubmitting ? 'Saving...' : 'Assign'}
                  </button>
                </div>
              </div>
            )}

            {canUpdateRequestStatus && (
              <div className="mb-6">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Update Status</div>
                <div className="flex gap-3">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={statusSubmitting}
                    className="flex-1 bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleUpdateRequestStatus()}
                    disabled={statusSubmitting}
                    className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {statusSubmitting ? 'Saving...' : 'Save Status'}
                  </button>
                </div>
              </div>
            )}

            {(canAssignTechnician || canUpdateRequestStatus) && (
              <div className="flex gap-3">
                {canUpdateRequestStatus && (
                  <button
                    type="button"
                    onClick={() => handleUpdateRequestStatus()}
                    disabled={statusSubmitting}
                    className="flex-1 px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Status
                  </button>
                )}
                {canAssignTechnician && (
                  <button
                    type="button"
                    onClick={handleAssignTechnician}
                    disabled={assignmentSubmitting || !selectedTechnicianId}
                    className="flex-1 px-4 py-2 border border-cyan-500 text-cyan-400 font-bold uppercase tracking-wider bg-cyan-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign Technician
                  </button>
                )}
                {canUpdateRequestStatus && (
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    disabled={statusSubmitting}
                    className="px-4 py-2 border border-red-500 text-red-400 font-bold uppercase tracking-wider hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create New Request Modal */}
      {showCreateModal && canCreateRequest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#0f1729] border border-cyan-500/30 rounded-lg max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Create New Request</h2>
                <p className="text-gray-400">Submit a maintenance work order</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateRequest}>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Title</label>
                <input
                  type="text"
                  className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Brief description of the issue"
                  value={newRequestForm.title}
                  onChange={(e) => handleCreateInputChange('title', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Equipment</label>
                  <select
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    value={newRequestForm.equipmentId}
                    onChange={(e) => handleCreateInputChange('equipmentId', e.target.value)}
                  >
                    <option value="">Select Equipment</option>
                    {equipmentOptions.map((equipment) => (
                      <option key={equipment.id} value={equipment.id}>
                        {equipment.name} ({equipment.serialNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Priority</label>
                  <select
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    value={newRequestForm.priority}
                    onChange={(e) => handleCreateInputChange('priority', e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Category</label>
                  <select
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    value={newRequestForm.category}
                    onChange={(e) => handleCreateInputChange('category', e.target.value)}
                  >
                    <option value="Repair">Repair</option>
                    <option value="Preventive Maintenance">Preventive Maintenance</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Inspection">Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    value={newRequestForm.dueDate}
                    onChange={(e) => handleCreateInputChange('dueDate', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                  rows="4"
                  className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Detailed description of the maintenance request..."
                  value={newRequestForm.description}
                  onChange={(e) => handleCreateInputChange('description', e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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

export default RequestsPage;
