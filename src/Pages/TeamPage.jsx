import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Edit,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { teamAPI, userAPI } from '../services/api';

const specializationOptions = ['Mechanics', 'Electricians', 'IT Support', 'HVAC', 'Plumbing', 'General'];
const assignableRoles = new Set(['Admin', 'Manager', 'Technician']);

const initialFormState = {
  name: '',
  description: '',
  specialization: 'General',
};

const TeamPage = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamsResponse, usersResponse] = await Promise.all([teamAPI.getAll(), userAPI.getAll()]);
      setTeams(Array.isArray(teamsResponse.data) ? teamsResponse.data : []);
      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      setError('Failed to load teams. Please try again.');
      setTeams([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name || '',
      description: team.description || '',
      specialization: team.specialization || 'General',
    });
    setShowEditModal(true);
  };

  const handleCreateTeam = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const response = await teamAPI.create({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        specialization: formData.specialization,
      });

      setTeams((prev) => [...prev, { ...response.data, members: response.data.members || [] }].sort((a, b) => a.name.localeCompare(b.name)));
      setShowAddModal(false);
      resetForm();
      alert('Team created successfully!');
    } catch (err) {
      console.error('Failed to create team:', err);
      alert(err.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTeam = async (event) => {
    event.preventDefault();

    if (!selectedTeam) return;

    try {
      setSubmitting(true);
      const response = await teamAPI.update(selectedTeam.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        specialization: formData.specialization,
      });

      setTeams((prev) =>
        prev
          .map((team) => (team.id === selectedTeam.id ? response.data : team))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setShowEditModal(false);
      setSelectedTeam(response.data);
      resetForm();
      alert('Team updated successfully!');
    } catch (err) {
      console.error('Failed to update team:', err);
      alert(err.message || 'Failed to update team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async (team) => {
    if (!window.confirm(`Delete "${team.name}"? Equipment linked to this team may fail until reassigned.`)) {
      return;
    }

    try {
      await teamAPI.delete(team.id);
      setTeams((prev) => prev.filter((item) => item.id !== team.id));
      if (selectedTeam?.id === team.id) {
        setSelectedTeam(null);
      }
      alert('Team deleted successfully!');
    } catch (err) {
      console.error('Failed to delete team:', err);
      alert(err.message || 'Failed to delete team');
    }
  };

  const replaceTeamInState = (updatedTeam) => {
    setTeams((prev) =>
      prev
        .map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    if (selectedTeam?.id === updatedTeam.id) {
      setSelectedTeam(updatedTeam);
    }
  };

  const handleAddMember = async (teamId, userId) => {
    if (!userId) return;

    try {
      const response = await teamAPI.addMember(teamId, Number(userId));
      replaceTeamInState(response.data);
      setUsers((prev) =>
        prev.map((user) => (user.id === Number(userId) ? { ...user, teamId } : user))
      );
      alert('Member assigned successfully!');
    } catch (err) {
      console.error('Failed to add team member:', err);
      alert(err.message || 'Failed to assign member');
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    try {
      const response = await teamAPI.removeMember(teamId, userId);
      replaceTeamInState(response.data);
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, teamId: null } : user))
      );
      alert('Member removed successfully!');
    } catch (err) {
      console.error('Failed to remove team member:', err);
      alert(err.message || 'Failed to remove member');
    }
  };

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization =
        filterSpecialization === 'all' || team.specialization === filterSpecialization;
      return matchesSearch && matchesSpecialization;
    });
  }, [filterSpecialization, searchTerm, teams]);

  const stats = [
    { label: 'Total Teams', value: teams.length, color: 'text-cyan-400', icon: Shield },
    {
      label: 'Total Members',
      value: teams.reduce((sum, team) => sum + (team.members?.length || 0), 0),
      color: 'text-green-400',
      icon: Users,
    },
    {
      label: 'Mechanical Teams',
      value: teams.filter((team) => team.specialization === 'Mechanics').length,
      color: 'text-yellow-400',
      icon: Wrench,
    },
    {
      label: 'General Teams',
      value: teams.filter((team) => team.specialization === 'General').length,
      color: 'text-blue-400',
      icon: CheckCircle2,
    },
  ];

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Specialization', 'Members', 'Description'];
    const rows = teams.map((team) =>
      [
        team.id,
        team.name,
        team.specialization,
        team.members?.length || 0,
        team.description || '',
      ]
        .map((field) => `"${String(field ?? '').replaceAll('"', '""')}"`)
        .join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teams-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getAvailableUsersForTeam = (teamId) =>
    users.filter(
      (user) =>
        assignableRoles.has(user.role) &&
        (!user.teamId || user.teamId === teamId)
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              MAINTENANCE <span className="text-cyan-400">TEAMS</span>
            </h1>
            <p className="text-gray-400">Create and maintain the teams used by equipment, requests, and scheduling.</p>
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
              onClick={openAddModal}
              className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold text-sm uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30"
            >
              <Plus className="w-4 h-4" />
              Add Team
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-[#0f1729] border border-cyan-900/20 p-4 rounded">
                <div className="flex items-start justify-between mb-3">
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search teams by name, specialization, or description..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-[#0f1729] border border-cyan-900/20 rounded px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <select
            value={filterSpecialization}
            onChange={(event) => setFilterSpecialization(event.target.value)}
            className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-white rounded focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Specializations</option>
            {specializationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeams.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 bg-[#0f1729] border border-cyan-900/20 rounded-lg p-12 text-center text-gray-500">
              No teams found
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div
                key={team.id}
                className="bg-[#0f1729] border border-cyan-900/20 rounded-lg p-6 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{team.name}</h3>
                    <span className="inline-flex px-3 py-1 rounded border bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs font-semibold uppercase">
                      {team.specialization}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(team)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Edit team"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-400 min-h-[48px] mb-5">
                  {team.description || 'No description provided yet.'}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-[#1a1f35] rounded p-3">
                    <div className="text-xs text-gray-500 uppercase mb-1">Team ID</div>
                    <div className="text-lg font-bold text-cyan-400">#{team.id}</div>
                  </div>
                  <div className="bg-[#1a1f35] rounded p-3">
                    <div className="text-xs text-gray-500 uppercase mb-1">Members</div>
                    <div className="text-lg font-bold text-green-400">{team.members?.length || 0}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Assigned Members</div>
                  <div className="space-y-2">
                    {(team.members || []).length === 0 ? (
                      <div className="text-sm text-gray-500">No members assigned yet</div>
                    ) : (
                      team.members.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center justify-between bg-[#1a1f35] rounded px-3 py-2 gap-3">
                          <div>
                            <div className="text-sm text-white">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.role}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs text-cyan-400">{member.email}</div>
                            <button
                              onClick={() => handleRemoveMember(team.id, member.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Remove member"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    {(team.members || []).length > 3 && (
                      <div className="text-xs text-gray-500">+{team.members.length - 3} more members</div>
                    )}
                  </div>
                </div>

                <TeamMemberAssign
                  team={team}
                  availableUsers={getAvailableUsersForTeam(team.id)}
                  onAssign={handleAddMember}
                />
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
          <div>
            Showing {filteredTeams.length} of {teams.length} teams
          </div>
        </div>
      </div>

      {showAddModal && (
        <TeamFormModal
          title="Create Team"
          description="Create a maintenance team that can be assigned to equipment and workflows."
          formData={formData}
          submitting={submitting}
          onChange={handleInputChange}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          onSubmit={handleCreateTeam}
          submitLabel="Create Team"
        />
      )}

      {showEditModal && (
        <TeamFormModal
          title="Edit Team"
          description="Update the team's name, specialization, or description."
          formData={formData}
          submitting={submitting}
          onChange={handleInputChange}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTeam(null);
            resetForm();
          }}
          onSubmit={handleUpdateTeam}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
};

const TeamMemberAssign = ({ team, availableUsers, onAssign }) => {
  const [selectedUserId, setSelectedUserId] = useState('');

  const assignMember = () => {
    if (!selectedUserId) return;
    onAssign(team.id, selectedUserId);
    setSelectedUserId('');
  };

  return (
    <div className="mt-5 pt-5 border-t border-cyan-900/20">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Assign Member</div>
      <div className="flex gap-2">
        <select
          value={selectedUserId}
          onChange={(event) => setSelectedUserId(event.target.value)}
          className="flex-1 bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
        >
          <option value="">Select a user</option>
          {availableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
        <button
          onClick={assignMember}
          type="button"
          className="px-3 py-2 bg-cyan-500 text-[#0a0e1a] rounded font-semibold text-sm hover:bg-cyan-400 transition-all disabled:opacity-50"
          disabled={!selectedUserId}
        >
          Assign
        </button>
      </div>
    </div>
  );
};

const TeamFormModal = ({ title, description, formData, submitting, onChange, onClose, onSubmit, submitLabel }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 overflow-y-auto">
      <div className="bg-[#0f1729] border border-cyan-500/30 rounded-lg max-w-2xl w-full p-8 my-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-gray-400 mt-1">{description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Team Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Specialization *</label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={onChange}
              required
              className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
            >
              {specializationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows="4"
              className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : submitLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-cyan-500 text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500/10 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamPage;
