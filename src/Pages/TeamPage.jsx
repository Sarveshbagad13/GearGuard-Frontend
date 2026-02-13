import React, { useState } from 'react';
import { Search, Filter, Plus, Download, MoreVertical, User, Users, Award, Clock, CheckCircle, Wrench, AlertCircle } from 'lucide-react';

const TeamsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Sample team members data
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 'TM-001',
      name: 'Mike Johnson',
      role: 'Senior Technician',
      department: 'Mechanical',
      email: 'mike.johnson@company.com',
      phone: '+1 (555) 123-4567',
      status: 'available',
      specialization: ['CNC Machines', 'Hydraulics', 'Welding'],
      certifications: ['OSHA Certified', 'AWS Welding', 'Hydraulic Systems'],
      assignedRequests: 3,
      completedRequests: 127,
      avgResponseTime: '2.5 hours',
      rating: 4.8,
      joinDate: '2021-03-15',
      availability: 'Full-time',
    },
    {
      id: 'TM-002',
      name: 'Tom Wilson',
      role: 'Maintenance Technician',
      department: 'Fleet',
      email: 'tom.wilson@company.com',
      phone: '+1 (555) 234-5678',
      status: 'busy',
      specialization: ['Vehicle Repair', 'Engine Diagnostics', 'Electrical'],
      certifications: ['ASE Certified', 'Forklift License'],
      assignedRequests: 5,
      completedRequests: 89,
      avgResponseTime: '3.1 hours',
      rating: 4.6,
      joinDate: '2022-01-10',
      availability: 'Full-time',
    },
    {
      id: 'TM-003',
      name: 'Alex Chen',
      role: 'IT Technician',
      department: 'IT Infrastructure',
      email: 'alex.chen@company.com',
      phone: '+1 (555) 345-6789',
      status: 'available',
      specialization: ['Network Admin', 'Server Maintenance', 'Hardware'],
      certifications: ['CompTIA A+', 'Network+', 'CCNA'],
      assignedRequests: 2,
      completedRequests: 156,
      avgResponseTime: '1.8 hours',
      rating: 4.9,
      joinDate: '2020-08-22',
      availability: 'Full-time',
    },
    {
      id: 'TM-004',
      name: 'Robert Lee',
      role: 'HVAC Specialist',
      department: 'Facilities',
      email: 'robert.lee@company.com',
      phone: '+1 (555) 456-7890',
      status: 'on-leave',
      specialization: ['HVAC Systems', 'Refrigeration', 'Climate Control'],
      certifications: ['EPA 608', 'NATE Certified', 'HVAC Excellence'],
      assignedRequests: 0,
      completedRequests: 203,
      avgResponseTime: '2.2 hours',
      rating: 4.7,
      joinDate: '2019-05-10',
      availability: 'On Leave',
    },
    {
      id: 'TM-005',
      name: 'Sarah Davis',
      role: 'Electrical Technician',
      department: 'Electrical',
      email: 'sarah.davis@company.com',
      phone: '+1 (555) 567-8901',
      status: 'available',
      specialization: ['Industrial Wiring', 'PLC Programming', 'Control Systems'],
      certifications: ['Licensed Electrician', 'NFPA 70E', 'Allen Bradley PLC'],
      assignedRequests: 4,
      completedRequests: 178,
      avgResponseTime: '2.8 hours',
      rating: 4.8,
      joinDate: '2020-11-05',
      availability: 'Full-time',
    },
    {
      id: 'TM-006',
      name: 'James Martinez',
      role: 'Junior Technician',
      department: 'Mechanical',
      email: 'james.martinez@company.com',
      phone: '+1 (555) 678-9012',
      status: 'busy',
      specialization: ['General Maintenance', 'Preventive Maintenance'],
      certifications: ['Basic Safety', 'Hand Tools'],
      assignedRequests: 3,
      completedRequests: 45,
      avgResponseTime: '4.2 hours',
      rating: 4.3,
      joinDate: '2023-06-01',
      availability: 'Full-time',
    },
  ]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: CheckCircle, label: 'Available' },
      busy: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/50', icon: Wrench, label: 'Busy' },
      'on-leave': { color: 'bg-gray-500/20 text-gray-400 border-gray-500/50', icon: AlertCircle, label: 'On Leave' },
      offline: { color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: AlertCircle, label: 'Offline' },
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

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < fullStars ? 'text-yellow-400' : 'text-gray-600'}>★</span>
        ))}
        <span className="text-sm text-gray-400 ml-1">({rating})</span>
      </div>
    );
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.specialization.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const stats = [
    { label: 'Total Technicians', value: teamMembers.length, color: 'text-cyan-400' },
    { label: 'Available', value: teamMembers.filter(m => m.status === 'available').length, color: 'text-green-400' },
    { label: 'Busy', value: teamMembers.filter(m => m.status === 'busy').length, color: 'text-orange-400' },
    { label: 'Avg Rating', value: (teamMembers.reduce((acc, m) => acc + m.rating, 0) / teamMembers.length).toFixed(1), color: 'text-yellow-400' },
  ];

  const departments = ['all', 'Mechanical', 'Electrical', 'Fleet', 'IT Infrastructure', 'Facilities'];

  // Export functionality
  const handleExport = () => {
    const headers = [
      'ID',
      'Name',
      'Role',
      'Department',
      'Email',
      'Phone',
      'Status',
      'Assigned Requests',
      'Completed Requests',
      'Rating',
      'Join Date'
    ];

    const csvRows = teamMembers.map(member => [
      member.id,
      member.name,
      member.role,
      member.department,
      member.email,
      member.phone,
      member.status,
      member.assignedRequests,
      member.completedRequests,
      member.rating,
      member.joinDate
    ].map(field => `"${field}"`).join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `team-members-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Successfully exported ${teamMembers.length} team members!`);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              MAINTENANCE <span className="text-cyan-400">TEAMS</span>
            </h1>
            <p className="text-gray-400">Manage technicians and coordinate work assignments</p>
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
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold text-sm uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30"
            >
              <Plus className="w-4 h-4" />
              Add Technician
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
              placeholder="Search by name, role, email, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1729] border border-cyan-900/20 rounded px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-white rounded focus:outline-none focus:border-cyan-500/50"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-white rounded focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="on-leave">On Leave</option>
            </select>

            <div className="flex border border-cyan-900/20 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm ${viewMode === 'grid' ? 'bg-cyan-500 text-[#0a0e1a]' : 'bg-[#0f1729] text-gray-400'} transition-all`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm ${viewMode === 'table' ? 'bg-cyan-500 text-[#0a0e1a]' : 'bg-[#0f1729] text-gray-400'} transition-all`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-[#0f1729] border border-cyan-900/20 rounded-lg p-6 hover:border-cyan-500/50 transition-all cursor-pointer group"
                onClick={() => setSelectedMember(member)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/50">
                      <User className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{member.name}</h3>
                      <p className="text-sm text-gray-400">{member.role}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-cyan-400 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Status & Department */}
                <div className="flex items-center justify-between mb-4">
                  {getStatusBadge(member.status)}
                  <span className="text-xs text-gray-500 uppercase">{member.department}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#1a1f35] rounded p-2">
                    <div className="text-xs text-gray-500 uppercase">Assigned</div>
                    <div className="text-lg font-bold text-cyan-400">{member.assignedRequests}</div>
                  </div>
                  <div className="bg-[#1a1f35] rounded p-2">
                    <div className="text-xs text-gray-500 uppercase">Completed</div>
                    <div className="text-lg font-bold text-green-400">{member.completedRequests}</div>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-3">
                  {getRatingStars(member.rating)}
                </div>

                {/* Specializations */}
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-2">Specializations</div>
                  <div className="flex flex-wrap gap-1">
                    {member.specialization.slice(0, 2).map((spec, idx) => (
                      <span key={idx} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded text-xs">
                        {spec}
                      </span>
                    ))}
                    {member.specialization.length > 2 && (
                      <span className="px-2 py-1 bg-gray-500/10 text-gray-400 rounded text-xs">
                        +{member.specialization.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-[#0f1729] border border-cyan-900/20 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1f35] border-b border-cyan-900/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Assigned</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Completed</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-900/20">
                  {filteredMembers.map((member) => (
                    <tr 
                      key={member.id}
                      className="hover:bg-[#1a1f35] transition-colors cursor-pointer"
                      onClick={() => setSelectedMember(member)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-cyan-400">{member.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/50">
                            <User className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{member.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(member.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-cyan-400">{member.assignedRequests}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-400">{member.completedRequests}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-white">{member.rating}</span>
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
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Showing {filteredMembers.length} of {teamMembers.length} team members
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-gray-400 rounded hover:border-cyan-500/50 transition-all">
              Previous
            </button>
            <button className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] rounded font-semibold">
              1
            </button>
            <button className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-gray-400 rounded hover:border-cyan-500/50 transition-all">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Team Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setSelectedMember(null)}>
          <div className="bg-[#0f1729] border border-cyan-500/30 rounded-lg max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center border-2 border-cyan-500/50">
                  <User className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedMember.name}</h2>
                  <p className="text-cyan-400">{selectedMember.role}</p>
                  <p className="text-sm text-gray-500">{selectedMember.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Status & Rating */}
            <div className="flex items-center gap-4 mb-6">
              {getStatusBadge(selectedMember.status)}
              {getRatingStars(selectedMember.rating)}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</div>
                <div className="text-white">{selectedMember.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</div>
                <div className="text-white">{selectedMember.phone}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Department</div>
                <div className="text-white">{selectedMember.department}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Availability</div>
                <div className="text-white">{selectedMember.availability}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Join Date</div>
                <div className="text-white">{selectedMember.joinDate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Response Time</div>
                <div className="text-white">{selectedMember.avgResponseTime}</div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#1a1f35] border border-cyan-900/20 rounded p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Assigned Requests</div>
                <div className="text-3xl font-bold text-cyan-400">{selectedMember.assignedRequests}</div>
              </div>
              <div className="bg-[#1a1f35] border border-cyan-900/20 rounded p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Completed</div>
                <div className="text-3xl font-bold text-green-400">{selectedMember.completedRequests}</div>
              </div>
              <div className="bg-[#1a1f35] border border-cyan-900/20 rounded p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Success Rate</div>
                <div className="text-3xl font-bold text-yellow-400">
                  {((selectedMember.completedRequests / (selectedMember.completedRequests + selectedMember.assignedRequests)) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="mb-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Specializations</div>
              <div className="flex flex-wrap gap-2">
                {selectedMember.specialization.map((spec, idx) => (
                  <span key={idx} className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/30 text-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="mb-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Certifications</div>
              <div className="flex flex-wrap gap-2">
                {selectedMember.certifications.map((cert, idx) => (
                  <span key={idx} className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/30 text-sm flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all">
                Assign Request
              </button>
              <button className="flex-1 px-4 py-2 border border-cyan-500 text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500/10 transition-all">
                View History
              </button>
              <button className="px-4 py-2 border border-cyan-500 text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500/10 transition-all">
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Technician Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#0f1729] border border-cyan-500/30 rounded-lg max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Add New Technician</h2>
                <p className="text-gray-400">Add a team member to the system</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Full Name</label>
                  <input
                    type="text"
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Role</label>
                  <input
                    type="text"
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    placeholder="Senior Technician"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Email</label>
                  <input
                    type="email"
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    placeholder="john.doe@company.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Phone</label>
                  <input
                    type="tel"
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Department</label>
                  <select className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50">
                    <option>Mechanical</option>
                    <option>Electrical</option>
                    <option>Fleet</option>
                    <option>IT Infrastructure</option>
                    <option>Facilities</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Availability</label>
                  <select className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Specializations (comma separated)</label>
                <input
                  type="text"
                  className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="CNC Machines, Hydraulics, Welding"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Certifications (comma separated)</label>
                <input
                  type="text"
                  className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="OSHA Certified, AWS Welding"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all"
                >
                  Add Technician
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

export default TeamsPage;