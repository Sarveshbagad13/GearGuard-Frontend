import React, { useState, useRef } from 'react';
import { Search, Filter, Plus, Download, Upload, MoreVertical, AlertTriangle, CheckCircle2, Clock, User, Wrench, XCircle } from 'lucide-react';

const RequestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sample requests data
  const [requestsData, setRequestsData] = useState([
    {
      id: 'REQ-001',
      title: 'CNC Machine A1 - Strange Noise',
      equipmentId: 'EQ-001',
      equipmentName: 'CNC Machine A1',
      location: 'Floor 2 - Bay 3',
      requestedBy: 'John Smith',
      assignedTo: 'Mike Johnson',
      priority: 'high',
      status: 'in-progress',
      category: 'Repair',
      description: 'Machine making unusual grinding noise during operation. Needs immediate inspection.',
      createdDate: '2024-02-10',
      dueDate: '2024-02-12',
      completedDate: null,
      estimatedTime: '4 hours',
    },
    {
      id: 'REQ-002',
      title: 'Forklift FL-205 - Scheduled Maintenance',
      equipmentId: 'EQ-002',
      equipmentName: 'Forklift FL-205',
      location: 'Warehouse A',
      requestedBy: 'Sarah Davis',
      assignedTo: 'Tom Wilson',
      priority: 'medium',
      status: 'pending',
      category: 'Preventive Maintenance',
      description: 'Regular monthly maintenance check. Oil change, brake inspection, and safety check required.',
      createdDate: '2024-02-11',
      dueDate: '2024-02-15',
      completedDate: null,
      estimatedTime: '2 hours',
    },
    {
      id: 'REQ-003',
      title: 'Server Rack SR-12 - Cooling Fan Replacement',
      equipmentId: 'EQ-003',
      equipmentName: 'Server Rack SR-12',
      location: 'Data Center - Row 5',
      requestedBy: 'IT Department',
      assignedTo: 'Alex Chen',
      priority: 'critical',
      status: 'in-progress',
      category: 'Emergency',
      description: 'Two cooling fans failed. Server temperature rising. Immediate action required.',
      createdDate: '2024-02-12',
      dueDate: '2024-02-12',
      completedDate: null,
      estimatedTime: '1 hour',
    },
    {
      id: 'REQ-004',
      title: 'HVAC Unit H-8 - Filter Replacement',
      equipmentId: 'EQ-004',
      equipmentName: 'HVAC Unit H-8',
      location: 'Building C - Roof',
      requestedBy: 'Facilities Team',
      assignedTo: 'Robert Lee',
      priority: 'low',
      status: 'completed',
      category: 'Preventive Maintenance',
      description: 'Quarterly filter replacement and system inspection.',
      createdDate: '2024-02-08',
      dueDate: '2024-02-10',
      completedDate: '2024-02-09',
      estimatedTime: '30 minutes',
    },
    {
      id: 'REQ-005',
      title: 'Delivery Van DV-03 - Brake Issue',
      equipmentId: 'EQ-005',
      equipmentName: 'Delivery Van DV-03',
      location: 'Parking Lot B',
      requestedBy: 'Driver - Mark Taylor',
      assignedTo: 'Unassigned',
      priority: 'high',
      status: 'pending',
      category: 'Repair',
      description: 'Brakes feel soft and require longer stopping distance. Safety concern.',
      createdDate: '2024-02-12',
      dueDate: '2024-02-13',
      completedDate: null,
      estimatedTime: '3 hours',
    },
    {
      id: 'REQ-006',
      title: 'Conveyor Belt CB-7 - Motor Failure',
      equipmentId: 'EQ-006',
      equipmentName: 'Conveyor Belt CB-7',
      location: 'Floor 1 - Assembly',
      requestedBy: 'Production Manager',
      assignedTo: 'Emergency Team',
      priority: 'critical',
      status: 'in-progress',
      category: 'Emergency',
      description: 'Motor completely failed. Production line stopped. Need immediate replacement.',
      createdDate: '2024-02-12',
      dueDate: '2024-02-12',
      completedDate: null,
      estimatedTime: '6 hours',
    },
  ]);

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
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold text-sm uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30"
            >
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </div>

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
                {filteredRequests.map((request) => (
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
                ))}
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

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all">
                Update Status
              </button>
              <button className="flex-1 px-4 py-2 border border-cyan-500 text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500/10 transition-all">
                Assign Technician
              </button>
              <button className="px-4 py-2 border border-red-500 text-red-400 font-bold uppercase tracking-wider hover:bg-red-500/10 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Request Modal */}
      {showCreateModal && (
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

            <form className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Title</label>
                <input
                  type="text"
                  className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Brief description of the issue"
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
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Priority</label>
                  <select className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Category</label>
                  <select className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50">
                    <option>Repair</option>
                    <option>Preventive Maintenance</option>
                    <option>Emergency</option>
                    <option>Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                  rows="4"
                  className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Detailed description of the maintenance request..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all"
                >
                  Submit Request
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