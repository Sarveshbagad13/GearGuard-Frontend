import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit,
  Mail,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { teamAPI, userAPI } from '../services/api';
import { ROLES, getRoleColor } from '../utils/rolePermissions';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  role: ROLES.USER,
  teamId: '',
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
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

      const [usersResponse, teamsResponse] = await Promise.all([
        userAPI.getAll(),
        teamAPI.getAll().catch(() => ({ data: [] })),
      ]);

      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      setTeams(Array.isArray(teamsResponse.data) ? teamsResponse.data : []);
    } catch (err) {
      console.error('Failed to load user management data:', err);
      setError('Failed to load users. Please try again.');
      setUsers([]);
      setTeams([]);
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

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || ROLES.USER,
      teamId: user.teamId ? String(user.teamId) : '',
    });
    setShowEditModal(true);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        teamId: formData.teamId ? Number(formData.teamId) : null,
      };

      const response = await userAPI.create(payload);
      setUsers((prev) => [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create user:', err);
      alert(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    if (!selectedUser) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        teamId: formData.teamId ? Number(formData.teamId) : null,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const response = await userAPI.update(selectedUser.id, payload);
      setUsers((prev) =>
        prev
          .map((item) => (item.id === selectedUser.id ? response.data : item))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
    } catch (err) {
      console.error('Failed to update user:', err);
      alert(err.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Deactivate "${user.name}"? This performs a soft delete.`)) {
      return;
    }

    try {
      await userAPI.delete(user.id);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('Failed to deactivate user:', err);
      alert(err.message || 'Failed to deactivate user');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.team?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [filterRole, searchTerm, users]);

  const stats = [
    { label: 'Total Users', value: users.length, color: 'text-cyan-400', icon: Users },
    {
      label: 'Admins',
      value: users.filter((user) => user.role === ROLES.ADMIN).length,
      color: 'text-red-400',
      icon: Shield,
    },
    {
      label: 'Technicians',
      value: users.filter((user) => user.role === ROLES.TECHNICIAN).length,
      color: 'text-blue-400',
      icon: User,
    },
    {
      label: 'Active Records',
      value: users.filter((user) => user.isActive).length,
      color: 'text-green-400',
      icon: CheckCircle2,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading user registry...</p>
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
              USER <span className="text-cyan-400">MAINTENANCE</span>
            </h1>
            <p className="text-gray-400">Administer user accounts, access roles, and team assignments.</p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-cyan-500 text-[#0a0e1a] font-bold text-sm uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or team..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-[#0f1729] border border-cyan-900/20 rounded px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <select
            value={filterRole}
            onChange={(event) => setFilterRole(event.target.value)}
            className="px-4 py-2 bg-[#0f1729] border border-cyan-900/20 text-white rounded focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Roles</option>
            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#0f1729] border border-cyan-900/20 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35] border-b border-cyan-900/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-900/20">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#1a1f35] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center">
                            <span className="text-cyan-400 font-semibold">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{user.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded border text-xs font-semibold ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{user.team?.name || 'Unassigned'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded border text-xs font-semibold ${
                            user.isActive
                              ? 'bg-green-500/20 text-green-400 border-green-500/40'
                              : 'bg-gray-500/20 text-gray-400 border-gray-500/40'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Deactivate user"
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

        <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
          <div>
            Showing {filteredUsers.length} of {users.length} active users
          </div>
        </div>
      </div>

      {showAddModal && (
        <UserFormModal
          title="Add User"
          description="Create a new user record and assign the correct role."
          formData={formData}
          teams={teams}
          submitting={submitting}
          onChange={handleInputChange}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          onSubmit={handleCreateUser}
          submitLabel="Create User"
          requirePassword
        />
      )}

      {showEditModal && (
        <UserFormModal
          title="Edit User"
          description="Update user details, role, or team assignment."
          formData={formData}
          teams={teams}
          submitting={submitting}
          onChange={handleInputChange}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
          }}
          onSubmit={handleUpdateUser}
          submitLabel="Save Changes"
          requirePassword={false}
        />
      )}
    </div>
  );
};

const UserFormModal = ({
  title,
  description,
  formData,
  teams,
  submitting,
  onChange,
  onClose,
  onSubmit,
  submitLabel,
  requirePassword,
}) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
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
              <label className="block text-sm text-gray-400 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
                className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Password {requirePassword ? '*' : '(leave blank to keep current)'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                required={requirePassword}
                minLength={8}
                className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={onChange}
                required
                className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
              >
                {Object.values(ROLES).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Team</label>
              <select
                name="teamId"
                value={formData.teamId}
                onChange={onChange}
                className="w-full bg-[#1a1f35] border border-cyan-900/20 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">No Team Assigned</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
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

export default UserManagementPage;
