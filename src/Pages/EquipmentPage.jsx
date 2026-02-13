import React, { useState } from 'react';
import { Search, Filter, Plus, Download, Upload, MoreVertical, AlertCircle, CheckCircle, Clock, Wrench } from 'lucide-react';

const EquipmentPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // Sample equipment data
  const equipmentData = [
    {
      id: 'EQ-001',
      name: 'CNC Machine A1',
      category: 'Manufacturing',
      location: 'Floor 2 - Bay 3',
      status: 'operational',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-02-15',
      condition: 95,
      serialNumber: 'CNC-2023-A1-4567',
      purchaseDate: '2023-05-10',
      warranty: 'Active until 2025-05-10',
    },
    {
      id: 'EQ-002',
      name: 'Forklift FL-205',
      category: 'Logistics',
      location: 'Warehouse A',
      status: 'maintenance',
      lastMaintenance: '2024-02-01',
      nextMaintenance: '2024-02-10',
      condition: 72,
      serialNumber: 'FL-2022-205-8901',
      purchaseDate: '2022-08-20',
      warranty: 'Expired',
    },
    {
      id: 'EQ-003',
      name: 'Server Rack SR-12',
      category: 'IT Infrastructure',
      location: 'Data Center - Row 5',
      status: 'operational',
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-03-20',
      condition: 98,
      serialNumber: 'SR-2023-12-3456',
      purchaseDate: '2023-11-05',
      warranty: 'Active until 2026-11-05',
    },
    {
      id: 'EQ-004',
      name: 'HVAC Unit H-8',
      category: 'Facility',
      location: 'Building C - Roof',
      status: 'warning',
      lastMaintenance: '2023-12-10',
      nextMaintenance: '2024-02-05',
      condition: 65,
      serialNumber: 'HVAC-2021-H8-7890',
      purchaseDate: '2021-03-15',
      warranty: 'Active until 2024-03-15',
    },
    {
      id: 'EQ-005',
      name: 'Delivery Van DV-03',
      category: 'Fleet',
      location: 'Parking Lot B',
      status: 'operational',
      lastMaintenance: '2024-01-25',
      nextMaintenance: '2024-04-25',
      condition: 88,
      serialNumber: 'DV-2022-03-5678',
      purchaseDate: '2022-06-12',
      warranty: 'Active until 2025-06-12',
    },
    {
      id: 'EQ-006',
      name: 'Conveyor Belt CB-7',
      category: 'Manufacturing',
      location: 'Floor 1 - Assembly',
      status: 'down',
      lastMaintenance: '2024-01-30',
      nextMaintenance: '2024-02-02',
      condition: 45,
      serialNumber: 'CB-2020-07-1234',
      purchaseDate: '2020-09-08',
      warranty: 'Expired',
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      operational: { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: CheckCircle, label: 'Operational' },
      maintenance: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: Wrench, label: 'In Maintenance' },
      warning: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/50', icon: AlertCircle, label: 'Needs Attention' },
      down: { color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: AlertCircle, label: 'Down' },
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

  const getConditionColor = (condition) => {
    if (condition >= 90) return 'text-green-400';
    if (condition >= 70) return 'text-yellow-400';
    if (condition >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const filteredEquipment = equipmentData.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || eq.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Equipment', value: equipmentData.length, color: 'text-cyan-400' },
    { label: 'Operational', value: equipmentData.filter(e => e.status === 'operational').length, color: 'text-green-400' },
    { label: 'In Maintenance', value: equipmentData.filter(e => e.status === 'maintenance').length, color: 'text-yellow-400' },
    { label: 'Down', value: equipmentData.filter(e => e.status === 'down').length, color: 'text-red-400' },
  ];

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
            <button className="px-4 py-2 border border-cyan-500/50 text-cyan-400 font-semibold text-sm uppercase tracking-wider hover:bg-cyan-500/10 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="px-4 py-2 border border-cyan-500/50 text-cyan-400 font-semibold text-sm uppercase tracking-wider hover:bg-cyan-500/10 transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold text-sm uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30">
              <Plus className="w-4 h-4" />
              Add Equipment
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
              placeholder="Search equipment by name, serial number, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1729] border border-cyan-900/20 rounded px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-gray-400 rounded hover:border-cyan-500/50 transition-all flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-white rounded focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Status</option>
              <option value="operational">Operational</option>
              <option value="maintenance">In Maintenance</option>
              <option value="warning">Warning</option>
              <option value="down">Down</option>
            </select>
          </div>
        </div>

        {/* Equipment Table */}
        <div className="bg-[#0f1729] border border-cyan-900/20 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35] border-b border-cyan-900/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Equipment ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Next Maintenance</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-900/20">
                {filteredEquipment.map((equipment) => (
                  <tr 
                    key={equipment.id}
                    className="hover:bg-[#1a1f35] transition-colors cursor-pointer"
                    onClick={() => setSelectedEquipment(equipment)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-cyan-400">{equipment.id}</div>
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
                      <div className={`text-sm font-bold ${getConditionColor(equipment.condition)}`}>
                        {equipment.condition}%
                      </div>
                      <div className="w-20 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full ${equipment.condition >= 70 ? 'bg-green-500' : equipment.condition >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${equipment.condition}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {equipment.nextMaintenance}
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
            Showing {filteredEquipment.length} of {equipmentData.length} equipment
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

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setSelectedEquipment(null)}>
          <div className="bg-[#0f1729] border border-cyan-500/30 rounded-lg max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedEquipment.name}</h2>
                <p className="text-cyan-400 font-mono">{selectedEquipment.id}</p>
              </div>
              <button 
                onClick={() => setSelectedEquipment(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Serial Number</div>
                <div className="text-white font-mono">{selectedEquipment.serialNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Category</div>
                <div className="text-white">{selectedEquipment.category}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</div>
                <div className="text-white">{selectedEquipment.location}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</div>
                {getStatusBadge(selectedEquipment.status)}
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Purchase Date</div>
                <div className="text-white">{selectedEquipment.purchaseDate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Warranty</div>
                <div className="text-white">{selectedEquipment.warranty}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Maintenance</div>
                <div className="text-white">{selectedEquipment.lastMaintenance}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Next Maintenance</div>
                <div className="text-white">{selectedEquipment.nextMaintenance}</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Equipment Condition</div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${selectedEquipment.condition >= 70 ? 'bg-green-500' : selectedEquipment.condition >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${selectedEquipment.condition}%` }}
                  />
                </div>
                <div className={`text-2xl font-bold ${getConditionColor(selectedEquipment.condition)}`}>
                  {selectedEquipment.condition}%
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all">
                Schedule Maintenance
              </button>
              <button className="flex-1 px-4 py-2 border border-cyan-500 text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500/10 transition-all">
                View History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentPage;