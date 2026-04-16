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
import { getStoredUser, normalizeRole, clearAllAuth } from '../utils/auth';
import { hasPermission } from '../utils/rolePermissions';
import { maintenanceRequestAPI, dashboardAPI, notificationAPI, equipmentAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Live data state
  const [statsData, setStatsData] = useState({
    stat1: '-',
    stat2: '-',
    stat3: '-',
    stat4: '-',
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [exportingFormat, setExportingFormat] = useState('');
  const [reportMonth, setReportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [equipmentAnalysis, setEquipmentAnalysis] = useState(null);
  const [equipmentAnalysisLoading, setEquipmentAnalysisLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const getBucketCount = (items, key, value) => {
    if (!Array.isArray(items)) return 0;
    const match = items.find((item) => item?.[key] === value);
    return Number(match?.count || 0);
  };

  const isSameDay = (dateValue) => {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchNotifications = async ({ background = false } = {}) => {
      if (!background && isMounted) {
        setNotificationsLoading(true);
      }

      try {
        const response = await notificationAPI.getMyNotifications({ limit: 8 }).catch(() => null);
        if (response?.success && isMounted) {
          setNotifications(Array.isArray(response.data) ? response.data : []);
          setUnreadCount(response?.meta?.unreadCount ?? 0);
        }
      } finally {
        if (!background && isMounted) {
          setNotificationsLoading(false);
        }
      }
    };

    fetchNotifications();

    const refreshTimer = setInterval(() => {
      fetchNotifications({ background: true });
    }, 20000);

    const onVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications({ background: true });
      }
    };

    window.addEventListener('focus', onVisibilityOrFocus);
    document.addEventListener('visibilitychange', onVisibilityOrFocus);

    return () => {
      isMounted = false;
      clearInterval(refreshTimer);
      window.removeEventListener('focus', onVisibilityOrFocus);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
    };
  }, [user]);

  // Fetch live dashboard data — branched by role
  useEffect(() => {
    if (!user) return;
    const role = normalizeRole(user.role);
    let isMounted = true;

    const fetchDashboardData = async ({ background = false } = {}) => {
      if (!background && isMounted) {
        setStatsLoading(true);
      }

      try {
        if (role === 'Admin' || role === 'Manager') {
          // ── Admin / Manager: system-wide overview ─────────────────────────
          const [dashRes, reqRes] = await Promise.all([
            dashboardAPI.getAdminDashboard().catch(() => null),
            maintenanceRequestAPI.getAll().catch(() => ({ data: [] })),
          ]);

          const requests = Array.isArray(reqRes.data) ? reqRes.data : [];

          if (dashRes?.data && isMounted) {
            const d = dashRes.data;
            const byStatus = d?.equipment?.byStatus || [];
            const byStage = d?.requests?.byStage || [];
            const repairedCount = getBucketCount(byStage, 'stage', 'Repaired');
            const activeEquipment = getBucketCount(byStatus, 'status', 'Active') || d?.equipment?.total || 0;
            const openRequests = Math.max((d?.requests?.total || 0) - repairedCount, 0);
            const completedToday = requests.filter((r) => r?.stage === 'Repaired' && isSameDay(r?.updatedAt)).length;

            setStatsData({
              stat1: activeEquipment,
              stat2: openRequests,
              stat3: completedToday,
              stat4: d?.overdueRequests ?? 0,
            });
          }

          if (isMounted) {
            setRecentActivity(
              [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
            );
          }

        } else if (role === 'Technician') {
          // ── Technician: personal task queue ────────────────────────────────
          const dashRes = await dashboardAPI.getTechnicianDashboard().catch(() => null);
          if (dashRes?.data && isMounted) {
            const d = dashRes.data;
            setStatsData({
              stat1: d?.requests?.inProgress ?? 0,
              stat2: d?.requests?.total ?? 0,
              stat3: d?.requests?.completed ?? 0,
              stat4: d?.requests?.pending ?? 0,
            });
            setRecentActivity(d?.upcomingTasks || []);
          }

        } else {
          // ── User / Employee: their own requests only ────────────────────────
          const dashRes = await dashboardAPI.getEmployeeDashboard().catch(() => null);
          if (dashRes?.data && isMounted) {
            const d = dashRes.data;
            setStatsData({
              stat1: d?.requests?.total ?? 0,
              stat2: d?.requests?.pending ?? 0,
              stat3: d?.requests?.completed ?? 0,
              stat4: d?.requests?.inProgress ?? 0,
            });
            setRecentActivity(d?.recentRequests || []);
          }
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    };

    fetchDashboardData();

    const refreshTimer = setInterval(() => {
      fetchDashboardData({ background: true });
    }, 15000);

    const onVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData({ background: true });
      }
    };

    window.addEventListener('focus', onVisibilityOrFocus);
    document.addEventListener('visibilitychange', onVisibilityOrFocus);

    return () => {
      isMounted = false;
      clearInterval(refreshTimer);
      window.removeEventListener('focus', onVisibilityOrFocus);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchEquipmentOptions = async () => {
      try {
        const response = await equipmentAPI.getAll().catch(() => null);
        if (response?.success && isMounted) {
          const items = Array.isArray(response.data) ? response.data : [];
          setEquipmentOptions(items);
          if (!selectedEquipmentId && items.length > 0) {
            setSelectedEquipmentId(String(items[0].id));
          }
        }
      } catch (error) {
        console.error('Failed to fetch equipment options:', error);
      }
    };

    const fetchRoleReport = async ({ background = false } = {}) => {
      if (!background && isMounted) {
        setReportLoading(true);
      }

      try {
        const response = await dashboardAPI.getRoleReport().catch(() => null);
        if (response?.success && isMounted) {
          setReportData(response.data || null);
        }
      } finally {
        if (isMounted) {
          setReportLoading(false);
        }
      }
    };

    fetchRoleReport();
    fetchEquipmentOptions();

    const refreshTimer = setInterval(() => {
      fetchRoleReport({ background: true });
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(refreshTimer);
    };
  }, [user]);

  useEffect(() => {
    if (!selectedEquipmentId) {
      setEquipmentAnalysis(null);
      return undefined;
    }

    let isMounted = true;

    const fetchEquipmentAnalysis = async () => {
      try {
        setEquipmentAnalysisLoading(true);
        const response = await dashboardAPI.getEquipmentAnalysis({ equipmentId: selectedEquipmentId }).catch(() => null);
        if (response?.success && isMounted) {
          setEquipmentAnalysis(response.data || null);
        }
      } catch (error) {
        console.error('Failed to fetch equipment analysis:', error);
      } finally {
        if (isMounted) {
          setEquipmentAnalysisLoading(false);
        }
      }
    };

    fetchEquipmentAnalysis();

    return () => {
      isMounted = false;
    };
  }, [selectedEquipmentId]);

  const handleLogout = () => {
    // Clear user object, accessToken, and refreshToken from localStorage
    clearAllAuth();
    navigate('/');
  };

  const refreshNotifications = async () => {
    const response = await notificationAPI.getMyNotifications({ limit: 8 }).catch(() => null);
    if (response?.success) {
      setNotifications(Array.isArray(response.data) ? response.data : []);
      setUnreadCount(response?.meta?.unreadCount ?? 0);
    }
  };

  const handleOpenNotification = async (item) => {
    if (!item) return;

    if (!item.isRead) {
      await notificationAPI.markAsRead(item.id).catch(() => null);
      await refreshNotifications();
    }

    setNotifOpen(false);
    if (item.entityType === 'MaintenanceRequest' && item.entityId) {
      navigate('/requests');
      return;
    }

    navigate('/notifications');
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllAsRead().catch(() => null);
    await refreshNotifications();
  };

  const triggerReportExport = async (format) => {
    if (!['Admin', 'Manager'].includes(userRole)) {
      return;
    }

    const [yearValue, monthValue] = reportMonth.split('-');
    const month = Number(monthValue);
    const year = Number(yearValue);

    if (!month || !year) {
      alert('Please select a valid month for export.');
      return;
    }

    try {
      setExportingFormat(format);
      const blob = await dashboardAPI.downloadRoleReport({
        month,
        year,
        format,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `gearguard-report-${year}-${String(month).padStart(2, '0')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Report export failed:', error);
      alert(error.message || 'Failed to export report');
    } finally {
      setExportingFormat('');
    }
  };

  // Helper: format a createdAt timestamp as a relative time string
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  // Helper: map a request stage to icon/color/label
  const getActivityMeta = (stage) => {
    switch (stage) {
      case 'Repaired':
        return { icon: CheckCircle2, color: 'text-green-400', border: 'border-green-500/20 hover:border-green-500/40', label: 'Maintenance request completed' };
      case 'In Progress':
        return { icon: Clock,         color: 'text-blue-400',  border: 'border-blue-500/20  hover:border-blue-500/40',  label: 'Request in progress' };
      case 'Scrap':
        return { icon: AlertCircle,   color: 'text-red-400',   border: 'border-red-500/20   hover:border-red-500/40',   label: 'Equipment marked for scrap' };
      default: // 'New'
        return { icon: AlertCircle,   color: 'text-yellow-400',border: 'border-yellow-500/20 hover:border-yellow-500/40', label: 'New maintenance request created' };
    }
  };

  // Role-based module access
  const getModulesForRole = (userRole) => {
    const normalizedRole = normalizeRole(userRole);
    const canManageUsers = hasPermission(normalizedRole, 'MANAGE_USERS');
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
      },
      {
        title: 'Users',
        description: 'Maintain user accounts and access levels',
        icon: Users,
        path: '/users',
        color: 'from-red-500 to-orange-500',
        stats: 'Admin only',
        roles: ['Admin']
      }
    ];

    // Filter strictly by the roles array on each module
    return allModules.filter(module => module.roles.includes(normalizedRole));
  };

  const modules = user ? getModulesForRole(user.role) : [];
  const userRole = normalizeRole(user?.role);

  // Role-specific stat cards
  const v = (key) => statsLoading ? '…' : (statsData[key] ?? '-');
  const quickStats =
    userRole === 'Admin' || userRole === 'Manager'
      ? [
          { label: 'Active Equipment',  value: v('stat1'), icon: Wrench,       color: 'text-cyan-400'   },
          { label: 'Open Requests',     value: v('stat2'), icon: AlertCircle,  color: 'text-yellow-400' },
          { label: 'Completed Today',   value: v('stat3'), icon: CheckCircle2, color: 'text-green-400'  },
          { label: 'Overdue Requests',  value: v('stat4'), icon: Clock,        color: 'text-blue-400'   },
        ]
      : userRole === 'Technician'
      ? [
          { label: 'In Progress',       value: v('stat1'), icon: Clock,        color: 'text-blue-400'   },
          { label: 'Assigned to Me',    value: v('stat2'), icon: Bell,         color: 'text-yellow-400' },
          { label: 'Completed',         value: v('stat3'), icon: CheckCircle2, color: 'text-green-400'  },
          { label: 'Pending Tasks',     value: v('stat4'), icon: AlertCircle,  color: 'text-red-400'    },
        ]
      : [
          { label: 'My Requests',       value: v('stat1'), icon: FileText,     color: 'text-cyan-400'   },
          { label: 'Open',              value: v('stat2'), icon: AlertCircle,  color: 'text-yellow-400' },
          { label: 'Completed',         value: v('stat3'), icon: CheckCircle2, color: 'text-green-400'  },
          { label: 'In Progress',       value: v('stat4'), icon: Clock,        color: 'text-blue-400'   },
        ];

  const reportCards = (() => {
    const scope = reportData?.scope;
    const personal = reportData?.personal;
    const teamSummary = reportData?.team?.summary;
    const globalSummary = reportData?.global?.summary;

    if (scope === 'global' && globalSummary) {
      return [
        { label: 'Equipments Repaired (All Teams)', value: globalSummary.repairedEquipments ?? 0, color: 'text-cyan-400' },
        { label: 'Requests Raised (All Users)', value: globalSummary.requestsRaisedByUsers ?? 0, color: 'text-yellow-400' },
        { label: 'Requests Solved (All Technicians)', value: globalSummary.solvedByTechnicians ?? 0, color: 'text-green-400' },
      ];
    }

    if (scope === 'team' && teamSummary) {
      return [
        { label: 'Equipments Repaired (My Team)', value: teamSummary.repairedEquipments ?? 0, color: 'text-cyan-400' },
        { label: 'Requests Raised (My Team Users)', value: teamSummary.requestsRaisedByUsers ?? 0, color: 'text-yellow-400' },
        { label: 'Requests Solved (My Team Technicians)', value: teamSummary.solvedByTechnicians ?? 0, color: 'text-green-400' },
      ];
    }

    if (personal?.type === 'technician') {
      return [
        { label: 'Requests Solved (Me)', value: personal.solved ?? 0, color: 'text-green-400' },
        { label: 'Verified Closed (Me)', value: personal.verifiedClosed ?? 0, color: 'text-cyan-400' },
        { label: 'My Average Rating', value: personal.avgRating ?? '0.00', color: 'text-yellow-400' },
      ];
    }

    return [
      { label: 'Requests Raised (Me)', value: personal?.raisedTotal ?? 0, color: 'text-yellow-400' },
      { label: 'Awaiting Verification (Me)', value: personal?.awaitingVerification ?? 0, color: 'text-cyan-400' },
      { label: 'Verified Closed (Me)', value: personal?.verifiedClosed ?? 0, color: 'text-green-400' },
    ];
  })();

  const reportList = (() => {
    if (reportData?.scope === 'global') {
      return (reportData?.global?.byTeam || []).slice(0, 5).map((item) => ({
        key: `team-${item.teamId}`,
        title: item.teamName,
        subtitle: `${item.repairedEquipments} equipments repaired`,
        value: `${item.repairedRequests} requests solved`,
      }));
    }

    if (reportData?.scope === 'team') {
      return (reportData?.team?.byTechnician || []).slice(0, 5).map((item) => ({
        key: `tech-${item.technicianId}`,
        title: item.name,
        subtitle: 'Technician solved requests',
        value: `${item.solvedCount}`,
      }));
    }

    return [];
  })();

  const formatDuration = (hours) => {
    if (hours === null || hours === undefined || Number.isNaN(Number(hours))) {
      return 'N/A';
    }

    const totalHours = Number(hours);
    if (totalHours < 24) {
      return `${totalHours.toFixed(1)} hrs`;
    }

    return `${(totalHours / 24).toFixed(1)} days`;
  };

  const formatDays = (days) => {
    if (days === null || days === undefined || Number.isNaN(Number(days))) {
      return 'N/A';
    }

    return `${Number(days).toFixed(1)} days`;
  };

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
              <div className="flex items-center">
              <img
                src="/gearguard-logo.png"
                alt="GearGuard Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((prev) => !prev)}
                  className="relative p-2 text-gray-400 hover:text-cyan-400 hover:bg-primary-darkest rounded-lg transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-primary-darker border border-cyan-500/20 rounded-xl shadow-2xl shadow-cyan-500/10 z-50">
                    <div className="p-3 border-b border-cyan-500/20 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-100">Notifications</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          Mark all read
                        </button>
                        <button
                          onClick={() => {
                            setNotifOpen(false);
                            navigate('/notifications');
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          View all
                        </button>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-auto">
                      {notificationsLoading ? (
                        <p className="p-4 text-sm text-gray-400">Loading notifications...</p>
                      ) : notifications.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
                      ) : (
                        notifications.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleOpenNotification(item)}
                            className={`w-full text-left p-3 border-b border-cyan-500/10 hover:bg-primary-darkest transition ${item.isRead ? 'opacity-70' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-gray-100 truncate">{item.title}</p>
                              {!item.isRead && <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1" />}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.message}</p>
                            <p className="text-[11px] text-gray-500 mt-2">{timeAgo(item.createdAt)}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3 pl-4 border-l border-cyan-500/20">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-100">{user?.name || 'User'}</p>
                  <p className="text-xs text-cyan-400">{userRole}</p>
                </div>
                <div className="w-10 h-10 bg-linear-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-cyan-500/30">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
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
            Welcome back, {user?.name || 'User'}! 👋
          </h2>
          <p className="text-gray-400">
            {userRole === 'Admin' && 'You have full system access. Manage all equipment, teams, and maintenance operations.'}
            {userRole === 'Manager' && 'Manage your team assignments, review requests, and track maintenance progress.'}
            {userRole === 'Technician' && 'View your assigned tasks, update request status, and manage scheduled maintenance.'}
            {userRole === 'User' && 'Create maintenance requests for equipment issues and track their progress.'}
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

        {/* Role-Based Report Snapshot */}
        <div className="mb-8 bg-primary-darker rounded-xl border border-cyan-500/20 p-6 shadow-lg shadow-cyan-500/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-100">Report Snapshot</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-cyan-400">
                {reportData?.scope || 'personal'} scope
              </span>
              {['Admin', 'Manager'].includes(userRole) && (
                <>
                  <input
                    type="month"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    className="bg-primary-darkest border border-cyan-500/20 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => triggerReportExport('csv')}
                    disabled={exportingFormat !== ''}
                    className="px-3 py-1 text-xs font-semibold border border-cyan-500/40 text-cyan-300 rounded hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportingFormat === 'csv' ? 'Exporting...' : 'Export CSV'}
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerReportExport('pdf')}
                    disabled={exportingFormat !== ''}
                    className="px-3 py-1 text-xs font-semibold border border-blue-500/40 text-blue-300 rounded hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportingFormat === 'pdf' ? 'Exporting...' : 'Export PDF'}
                  </button>
                </>
              )}
            </div>
          </div>

          {reportLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {reportCards.map((card) => (
                  <div key={card.label} className="bg-primary-darkest border border-cyan-500/10 rounded-lg p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{card.label}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>

              {reportData?.scope === 'team' && reportData?.team?.team?.name && (
                <p className="text-sm text-gray-400 mb-3">
                  Team: <span className="text-cyan-300 font-medium">{reportData.team.team.name}</span>
                </p>
              )}

              {reportList.length > 0 && (
                <div className="space-y-2">
                  {reportList.map((item) => (
                    <div key={item.key} className="flex items-center justify-between bg-primary-darkest border border-cyan-500/10 rounded-lg p-3">
                      <div>
                        <p className="text-sm text-gray-100 font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                      </div>
                      <p className="text-sm text-cyan-300 font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Equipment Analysis */}
        <div className="mb-8 bg-primary-darker rounded-xl border border-cyan-500/20 p-6 shadow-lg shadow-cyan-500/5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-100">Equipment Analysis</h3>
              <p className="text-sm text-gray-400">Review repair duration and the average time between repairs for a single asset.</p>
            </div>

            <select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
              className="bg-primary-darkest border border-cyan-500/20 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-400 min-w-0 md:min-w-72"
            >
              <option value="">Select equipment</option>
              {equipmentOptions.map((equipment) => (
                <option key={equipment.id} value={equipment.id}>
                  {equipment.name} ({equipment.serialNumber})
                </option>
              ))}
            </select>
          </div>

          {equipmentAnalysisLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
            </div>
          ) : equipmentAnalysis?.equipment ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-primary-darkest border border-cyan-500/10 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Repair Count</p>
                  <p className="text-2xl font-bold text-cyan-400">{equipmentAnalysis.summary.repairCount}</p>
                </div>
                <div className="bg-primary-darkest border border-cyan-500/10 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Avg Repair Time</p>
                  <p className="text-2xl font-bold text-green-400">{formatDuration(equipmentAnalysis.summary.avgRepairDurationHours)}</p>
                </div>
                <div className="bg-primary-darkest border border-cyan-500/10 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Avg Time Between Repairs</p>
                  <p className="text-2xl font-bold text-yellow-400">{formatDays(equipmentAnalysis.summary.avgDaysBetweenRepairs)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-primary-darkest border border-cyan-500/10 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Equipment Details</p>
                  <p className="text-gray-100 font-medium">{equipmentAnalysis.equipment.name}</p>
                  <p className="text-sm text-gray-400">Serial: {equipmentAnalysis.equipment.serialNumber}</p>
                  <p className="text-sm text-gray-400">Team: {equipmentAnalysis.equipment.maintenanceTeam?.name || 'Unassigned'}</p>
                  <p className="text-sm text-gray-400">Location: {equipmentAnalysis.equipment.location}</p>
                </div>
                <div className="bg-primary-darkest border border-cyan-500/10 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Repair Timing</p>
                  <p className="text-sm text-gray-300">Total repair time: <span className="text-cyan-300 font-medium">{formatDuration(equipmentAnalysis.summary.totalRepairDurationHours)}</span></p>
                  <p className="text-sm text-gray-300">Days since last repair: <span className="text-cyan-300 font-medium">{formatDays(equipmentAnalysis.summary.daysSinceLastRepair)}</span></p>
                  <p className="text-sm text-gray-300">Last repaired on: <span className="text-cyan-300 font-medium">{equipmentAnalysis.summary.lastCompletedDate ? new Date(equipmentAnalysis.summary.lastCompletedDate).toLocaleDateString() : 'N/A'}</span></p>
                  <p className="text-sm text-gray-300">First repaired on: <span className="text-cyan-300 font-medium">{equipmentAnalysis.summary.firstCompletedDate ? new Date(equipmentAnalysis.summary.firstCompletedDate).toLocaleDateString() : 'N/A'}</span></p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-100 mb-3">Recent Repair History</p>
                {equipmentAnalysis.history.length === 0 ? (
                  <p className="text-sm text-gray-500">No completed repair history found for this equipment.</p>
                ) : (
                  <div className="space-y-2">
                    {equipmentAnalysis.history.slice(-5).reverse().map((item) => (
                      <div key={item.requestId} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-primary-darkest border border-cyan-500/10 rounded-lg p-3">
                        <div>
                          <p className="text-sm text-gray-100 font-medium">{item.requestNumber}</p>
                          <p className="text-xs text-gray-500">Completed {item.completedDate ? new Date(item.completedDate).toLocaleDateString() : 'N/A'} by {item.technicianName}</p>
                        </div>
                        <div className="text-sm text-gray-300">
                          Repair duration: <span className="text-cyan-300 font-medium">{formatDuration(item.repairDurationHours)}</span>
                        </div>
                        <div className="text-sm text-gray-300">
                          Rating: <span className="text-green-300 font-medium">{item.rating ?? 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Choose equipment to see repair timing analysis.</p>
          )}
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
                  <div className={`w-12 h-12 bg-linear-to-br ${module.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
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
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No recent activity found.
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((req) => {
                const meta = getActivityMeta(req.stage);
                const Icon = meta.icon;
                const equipmentName = req.equipment?.name || 'Unknown Equipment';
                const requestNum   = req.requestNumber || `#${req.id}`;
                return (
                  <div
                    key={req.id}
                    className={`flex items-center p-4 bg-primary-darkest border ${meta.border} rounded-lg transition`}
                  >
                    <Icon className={`w-5 h-5 ${meta.color} mr-3 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-100 truncate">
                        {meta.label} — {requestNum}
                      </p>
                      <p className="text-xs text-gray-400">
                        {equipmentName} · {timeAgo(req.createdAt)}
                      </p>
                    </div>
                    <span className={`ml-3 shrink-0 text-xs font-semibold px-2 py-0.5 rounded ${meta.color} bg-white/5`}>
                      {req.stage}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
