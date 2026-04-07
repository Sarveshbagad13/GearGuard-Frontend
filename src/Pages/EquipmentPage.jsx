import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, AlertCircle, CheckCircle, Wrench, Edit, Trash2, X } from 'lucide-react';
import { equipmentAPI, teamAPI, userAPI } from '../services/api';

const technicianAssignableRoles = new Set(['Admin', 'Manager', 'Technician']);

const EquipmentPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // API States
  const [equipmentData, setEquipmentData] = useState([]);
  const [teams, setTeams] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    category: 'Other',
    purchaseDate: '',
    warrantyExpiry: '',
    location: '',
    ownershipType: 'Department',
    department: '',
    assignedEmployeeName: '',
    assignedEmployeeEmail: '',
    maintenanceTeamId: '',
    defaultTechnicianId: '',
    status: 'Active',
    notes: '',
    safetyInstructions: ''
  });

  // Fetch equipment on component mount
  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [equipmentResponse, teamsResponse, techniciansResponse] = await Promise.all([
        equipmentAPI.getAll(),
        teamAPI.getAll().catch(() => ({ data: [] })),
        userAPI.getAll({ role: 'Technician' }).catch(() => ({ data: [] }))
      ]);

      setEquipmentData(Array.isArray(equipmentResponse.data) ? equipmentResponse.data : []);
      setTeams(Array.isArray(teamsResponse.data) ? teamsResponse.data : []);
      const fetchedTechnicians = Array.isArray(techniciansResponse.data) ? techniciansResponse.data : [];
      setTechnicians(fetchedTechnicians.filter((user) => technicianAssignableRoles.has(user.role)));
    } catch (err) {
      setError('Failed to load equipment. Please try again.');
      console.error('Error fetching equipment:', err);
      setEquipmentData([]);
      setTeams([]);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  const buildEquipmentPayload = (data) => ({
    name: data.name.trim(),
    serialNumber: data.serialNumber.trim(),
    category: data.category,
    purchaseDate: data.purchaseDate,
    warrantyExpiry: data.warrantyExpiry || null,
    location: data.location.trim(),
    ownershipType: data.ownershipType,
    department: data.department.trim() || null,
    assignedEmployeeName: data.assignedEmployeeName.trim() || null,
    assignedEmployeeEmail: data.assignedEmployeeEmail.trim() || null,
    maintenanceTeamId: data.maintenanceTeamId ? Number(data.maintenanceTeamId) : null,
    defaultTechnicianId: data.defaultTechnicianId ? Number(data.defaultTechnicianId) : null,
    status: data.status,
    notes: data.notes.trim() || null,
    safetyInstructions: data.safetyInstructions.trim() || null
  });

  // Handle Export
  const handleExport = () => {
    const headers = ['ID', 'Name', 'Serial Number', 'Category', 'Location', 'Status', 'Department'];
    const csvRows = equipmentData.map((equipment) =>
      [
        equipment.id,
        equipment.name,
        equipment.serialNumber,
        equipment.category,
        equipment.location,
        equipment.status,
        equipment.department || ''
      ]
        .map((field) => `"${String(field ?? '').replaceAll('"', '""')}"`)
        .join(',')
    );

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipment-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Add Equipment
  const handleAddEquipment = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const response = await equipmentAPI.create(buildEquipmentPayload(formData));
      setEquipmentData((prev) => [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      setShowAddModal(false);
      resetForm();
      alert('Equipment added successfully!');
    } catch (err) {
      alert(err.message || 'Failed to add equipment');
      console.error('Add error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Update Equipment
  const handleUpdateEquipment = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const response = await equipmentAPI.update(selectedEquipment.id, buildEquipmentPayload(formData));
      const updated = response.data;
      setEquipmentData(equipmentData.map(eq => eq.id === selectedEquipment.id ? updated : eq));
      setShowEditModal(false);
      setSelectedEquipment(null);
      resetForm();
      alert('Equipment updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update equipment');
      console.error('Update error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Equipment
  const handleDeleteEquipment = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await equipmentAPI.delete(id);
        setEquipmentData(equipmentData.filter(eq => eq.id !== id));
        setSelectedEquipment(null);
        alert('Equipment deleted successfully!');
      } catch (err) {
        alert(err.message || 'Failed to delete equipment');
        console.error('Delete error:', err);
      }
    }
  };

  // Open Edit Modal
  const openEditModal = (equipment) => {
    setSelectedEquipment(equipment);
    setFormData({
      name: equipment.name,
      serialNumber: equipment.serialNumber,
      category: equipment.category,
      purchaseDate: equipment.purchaseDate?.split('T')[0] || '',
      warrantyExpiry: equipment.warrantyExpiry?.split('T')[0] || '',
      location: equipment.location,
      ownershipType: equipment.ownershipType,
      department: equipment.department || '',
      assignedEmployeeName: equipment.assignedEmployeeName || '',
      assignedEmployeeEmail: equipment.assignedEmployeeEmail || '',
      maintenanceTeamId: equipment.maintenanceTeamId ? String(equipment.maintenanceTeamId) : '',
      defaultTechnicianId: equipment.defaultTechnicianId ? String(equipment.defaultTechnicianId) : '',
      status: equipment.status,
      notes: equipment.notes || '',
      safetyInstructions: equipment.safetyInstructions || ''
    });
    setShowEditModal(true);
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      name: '',
      serialNumber: '',
      category: 'Other',
      purchaseDate: '',
      warrantyExpiry: '',
      location: '',
      ownershipType: 'Department',
      department: '',
      assignedEmployeeName: '',
      assignedEmployeeEmail: '',
      maintenanceTeamId: '',
      defaultTechnicianId: '',
      status: 'Active',
      notes: '',
      safetyInstructions: ''
    });
  };

  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get Status Badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: CheckCircle, label: 'Active' },
      'Under Maintenance': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: Wrench, label: 'Under Maintenance' },
      'Scrapped': { color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: AlertCircle, label: 'Scrapped' },
      'Retired': { color: 'bg-gray-500/20 text-gray-400 border-gray-500/50', icon: AlertCircle, label: 'Retired' },
    };

    const config = statusConfig[status] || statusConfig['Active'];
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded border ${config.color} text-xs font-semibold uppercase flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Filter Equipment
  const filteredEquipment = equipmentData.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || eq.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || eq.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate Stats
  const stats = [
    { label: 'Total Equipment', value: equipmentData.length, color: 'text-cyan-400' },
    { label: 'Active', value: equipmentData.filter(e => e.status === 'Active').length, color: 'text-green-400' },
    { label: 'Under Maintenance', value: equipmentData.filter(e => e.status === 'Under Maintenance').length, color: 'text-yellow-400' },
    { label: 'Scrapped', value: equipmentData.filter(e => e.status === 'Scrapped').length, color: 'text-red-400' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading equipment data...</p>
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
              EQUIPMENT <span className="text-cyan-400">REGISTRY</span>
            </h1>
            <p className="text-gray-400">Track and manage all your assets in one place</p>
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
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold text-sm uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-200">{error}</p>
          </div>
        )}

        {teams.length === 0 && (
          <div className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <p className="text-orange-200">
              No maintenance teams are available. Equipment creation requires a team, so create at least one team first.
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
              placeholder="Search equipment by name, serial number, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1729] border border-cyan-900/20 rounded px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-white rounded focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Categories</option>
              <option value="Machinery">Machinery</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Computers">Computers</option>
              <option value="Tools">Tools</option>
              <option value="HVAC">HVAC</option>
              <option value="Other">Other</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-white rounded focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Scrapped">Scrapped</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        {/* Equipment Table */}
        <div className="bg-[#0f1729] border border-cyan-900/20 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35] border-b border-cyan-900/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-900/20">
                {filteredEquipment.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No equipment found
                    </td>
                  </tr>
                ) : (
                  filteredEquipment.map((equipment) => (
                    <tr 
                      key={equipment.id}
                      className="hover:bg-[#1a1f35] transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-cyan-400">#{equipment.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-white">{equipment.name}</div>
                        <div className="text-xs text-gray-500">{equipment.serialNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{equipment.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{equipment.location}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(equipment.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{equipment.department || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditModal(equipment)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEquipment(equipment.id, equipment.name)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Showing {filteredEquipment.length} of {equipmentData.length} equipment
          </div>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-[#0f1729] border border-cyan-500/30 rounded-lg max-w-2xl w-full p-8 my-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Equipment</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Serial Number *</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Machinery">Machinery</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Computers">Computers</option>
                    <option value="Tools">Tools</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    name="warrantyExpiry"
                    value={formData.warrantyExpiry}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ownership Type *</label>
                  <select
                    name="ownershipType"
                    value={formData.ownershipType}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Department">Department</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Maintenance Team ID *</label>
                  <select
                    name="maintenanceTeamId"
                    value={formData.maintenanceTeamId}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">Select a team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Default Technician</label>
                  <select
                    name="defaultTechnicianId"
                    value={formData.defaultTechnicianId}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Scrapped">Scrapped</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Equipment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-cyan-500 text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-[#0f1729] border border-cyan-500/30 rounded-lg max-w-2xl w-full p-8 my-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Equipment</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateEquipment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Serial Number *</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Machinery">Machinery</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Computers">Computers</option>
                    <option value="Tools">Tools</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    name="warrantyExpiry"
                    value={formData.warrantyExpiry}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Maintenance Team *</label>
                  <select
                    name="maintenanceTeamId"
                    value={formData.maintenanceTeamId}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">Select a team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Default Technician</label>
                  <select
                    name="defaultTechnicianId"
                    value={formData.defaultTechnicianId}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Assigned Employee Name</label>
                  <input
                    type="text"
                    name="assignedEmployeeName"
                    value={formData.assignedEmployeeName}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Assigned Employee Email</label>
                  <input
                    type="email"
                    name="assignedEmployeeEmail"
                    value={formData.assignedEmployeeEmail}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ownership Type *</label>
                  <select
                    name="ownershipType"
                    value={formData.ownershipType}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Department">Department</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Scrapped">Scrapped</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Safety Instructions</label>
                <textarea
                  name="safetyInstructions"
                  value={formData.safetyInstructions}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Updating...' : 'Update Equipment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-cyan-500 text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500/10 transition-all"
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

export default EquipmentPage;
