import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Wrench, 
  FileText, 
  Users, 
  Calendar,
  LayoutGrid,
  LogOut,
  Settings,
  Bell,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Role-based module access
  const getModulesForRole = (userRole) => {
    const allModules = [
      {
        title: 'Equipment',
        description: 'Manage and track all equipment',
        icon: Wrench,
        path: '/equipment',
        color: 'from-cyan-500 to-cyan-600',
        stats: 'Track assets',
        roles: ['Admin', 'Manager', 'Technician']
      },
      {
        title: 'Requests',
        description: 'View and manage maintenance requests',
        icon: FileText,
        path: '/requests',
        color: 'from-blue-500 to-blue-600',
        stats: 'Monitor requests',
        roles: ['Admin', 'Manager', 'Technician', 'User']
      },
      {
        title: 'Kanban Board',
        description: 'Visual workflow management',
        icon: LayoutGrid,
        path: '/kanban',
        color: 'from-teal-500 to-teal-600',
        stats: 'Drag & Drop',
        roles: ['Admin', 'Manager', 'Technician']
      },
      {
        title: 'Calendar',
        description: 'Schedule preventive maintenance',
        icon: Calendar,
        path: '/calendar',
        color: 'from-cyan-400 to-cyan-500',
        stats: 'Plan ahead',
        roles: ['Admin', 'Manager', 'Technician']
      },
      {
        title: 'Teams',
        description: 'Manage maintenance teams',
        icon: Users,
        path: '/teams',
        color: 'from-blue-400 to-blue-500',
        stats: 'Coordinate staff',
        roles: ['Admin', 'Manager']
      }
    ];

    // Filter modules based on user role
    return allModules.filter(module => module.roles.includes(userRole));
  };

  const modules = user ? getModulesForRole(user.role) : [];

  const quickStats = [
    { label: 'Active Equipment', value: '47', icon: Wrench, color: 'text-cyan-400' },
    { label: 'Open Requests', value: '12', icon: AlertCircle, color: 'text-yellow-400' },
    { label: 'Completed Today', value: '8', icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Avg Response Time', value: '2.4h', icon: Clock, color: 'text-blue-400' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark relative">
      {/* Grid Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative bg-primary-darker border-b border-cyan-500/20 shadow-lg shadow-cyan-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-2 rounded-lg shadow-lg shadow-cyan-500/30">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-100">GearGuard</h1>
                <p className="text-sm text-cyan-400">The Ultimate Maintenance Tracker</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-cyan-400 hover:bg-primary-darkest rounded-lg transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3 pl-4 border-l border-cyan-500/20">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-100">{user.name}</p>
                  <p className="text-xs text-cyan-400">{user.role || 'User'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-cyan-500/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-gray-400">
            {user.role === 'Admin' && 'You have full system access. Manage all equipment, teams, and maintenance operations.'}
            {user.role === 'Manager' && 'Manage your team assignments, review requests, and track maintenance progress.'}
            {user.role === 'Technician' && 'View your assigned tasks, update request status, and manage scheduled maintenance.'}
            {user.role === 'User' && 'Create maintenance requests for equipment issues and track their progress.'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-primary-darker rounded-xl border border-cyan-500/20 p-6 hover:border-cyan-500/40 transition shadow-lg shadow-cyan-500/5">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-2xl font-bold text-gray-100">{stat.value}</span>
              </div>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Module Cards */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Link
                  key={index}
                  to={module.path}
                  className="group bg-primary-darker rounded-xl border border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/10"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-100 mb-2">
                    {module.title}
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">
                    {module.description}
                  </p>
                  <div className="flex items-center text-sm text-cyan-400">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {module.stats}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-primary-darker rounded-xl border border-cyan-500/20 p-6 shadow-lg shadow-cyan-500/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-100">Recent Activity</h3>
            <Link to="/requests" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-primary-darkest border border-green-500/20 rounded-lg hover:border-green-500/40 transition">
              <CheckCircle2 className="w-5 h-5 text-green-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-100">Maintenance Request #REQ-001 completed</p>
                <p className="text-xs text-gray-400">CNC Machine A1 - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-primary-darkest border border-yellow-500/20 rounded-lg hover:border-yellow-500/40 transition">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-100">New maintenance request created</p>
                <p className="text-xs text-gray-400">Forklift FL-205 - 4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-primary-darkest border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition">
              <Calendar className="w-5 h-5 text-purple-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-100">Preventive maintenance scheduled</p>
                <p className="text-xs text-gray-400">Server Rack SR-12 - Tomorrow at 10:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
