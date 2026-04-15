import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, Filter, RefreshCw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';

const NOTIFICATION_TYPES = [
  { value: '', label: 'All types' },
  { value: 'new-request', label: 'New Request' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'status-change', label: 'Status Change' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'performance', label: 'Performance' },
  { value: 'rating', label: 'Rating' },
  { value: 'system', label: 'System' },
];

const PAGE_SIZE = 15;

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingIds, setPendingIds] = useState([]);
  const [markAllPending, setMarkAllPending] = useState(false);

  const [selectedType, setSelectedType] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const selectedTypeLabel = useMemo(() => {
    const option = NOTIFICATION_TYPES.find((item) => item.value === selectedType);
    return option?.label || 'All types';
  }, [selectedType]);

  const fetchNotifications = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    setError('');

    try {
      const filters = {
        page,
        limit: PAGE_SIZE,
      };

      if (selectedType) {
        filters.type = selectedType;
      }
      if (unreadOnly) {
        filters.unreadOnly = 'true';
      }

      const response = await notificationAPI.getMyNotifications(filters);

      if (response?.success) {
        setNotifications(Array.isArray(response.data) ? response.data : []);
        setTotalPages(response?.meta?.totalPages || 1);
        setTotal(response?.meta?.total || 0);
        setUnreadCount(response?.meta?.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      setNotifications([]);
      setError('Unable to load notifications right now.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, selectedType, unreadOnly]);

  const goToRequestFromNotification = (notification) => {
    if (notification?.entityType === 'MaintenanceRequest' && notification?.entityId) {
      navigate('/requests');
      return;
    }

    navigate('/dashboard');
  };

  const handleMarkRead = async (id) => {
    if (pendingIds.includes(id)) return;

    const target = notifications.find((item) => item.id === id);
    if (!target || target.isRead) return;

    setPendingIds((prev) => [...prev, id]);
    const prevNotifications = notifications;
    const prevUnreadCount = unreadCount;
    const prevTotal = total;

    const nextNotifications = unreadOnly
      ? notifications.filter((item) => item.id !== id)
      : notifications.map((item) =>
          item.id === id
            ? {
                ...item,
                isRead: true,
              }
            : item
        );

    setNotifications(nextNotifications);
    setUnreadCount((prev) => Math.max(prev - 1, 0));
    if (unreadOnly) {
      setTotal((prev) => Math.max(prev - 1, 0));
    }

    try {
      await notificationAPI.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
      setTotal(prevTotal);
      setError('Could not mark notification as read.');
    } finally {
      setPendingIds((prev) => prev.filter((entry) => entry !== id));
    }
  };

  const handleMarkAllRead = async () => {
    if (markAllPending) return;

    setMarkAllPending(true);
    const prevNotifications = notifications;
    const prevUnreadCount = unreadCount;
    const prevTotal = total;

    if (unreadOnly) {
      setNotifications([]);
      setTotal(0);
    } else {
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    }
    setUnreadCount(0);

    try {
      await notificationAPI.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
      setTotal(prevTotal);
      setError('Could not mark all notifications as read.');
    } finally {
      setMarkAllPending(false);
    }
  };

  const handleDelete = async (id) => {
    if (pendingIds.includes(id)) return;

    const target = notifications.find((item) => item.id === id);
    if (!target) return;

    setPendingIds((prev) => [...prev, id]);
    const prevNotifications = notifications;
    const prevUnreadCount = unreadCount;
    const prevTotal = total;

    const nextNotifications = notifications.filter((item) => item.id !== id);
    const nextTotal = Math.max(total - 1, 0);
    const nextUnreadCount = target.isRead ? unreadCount : Math.max(unreadCount - 1, 0);

    setNotifications(nextNotifications);
    setTotal(nextTotal);
    setUnreadCount(nextUnreadCount);

    try {
      await notificationAPI.delete(id);
      const isLastItemOnPage = nextNotifications.length === 0;
      if (isLastItemOnPage && page > 1) {
        setPage((prev) => Math.max(prev - 1, 1));
      }
    } catch (err) {
      console.error('Failed to delete notification', err);
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
      setTotal(prevTotal);
      setError('Could not delete notification.');
    } finally {
      setPendingIds((prev) => prev.filter((entry) => entry !== id));
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark relative">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs uppercase tracking-wide mb-3">
              <Bell className="w-3.5 h-3.5" />
              Notifications
            </div>
            <h1 className="text-3xl font-bold text-gray-100">Notification Center</h1>
            <p className="text-gray-400 mt-1">
              {unreadCount} unread of {total} total
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotifications()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/10 transition"
              disabled={markAllPending}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-green-500/25 text-green-300 hover:bg-green-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={markAllPending || notifications.length === 0}
            >
              <CheckCircle2 className="w-4 h-4" />
              {markAllPending ? 'Updating...' : 'Mark all read'}
            </button>
          </div>
        </div>

        <section className="bg-primary-darker border border-cyan-500/20 rounded-xl p-4 mb-5 shadow-lg shadow-cyan-500/5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex items-center gap-2 text-sm text-gray-300">
              <Filter className="w-4 h-4 text-cyan-400" />
              Filters
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedType}
                onChange={(e) => {
                  setPage(1);
                  setSelectedType(e.target.value);
                }}
                className="bg-primary-darkest border border-cyan-500/25 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-400"
              >
                {NOTIFICATION_TYPES.map((type) => (
                  <option key={type.value || 'all'} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-darkest border border-cyan-500/25 text-sm text-gray-200">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => {
                    setPage(1);
                    setUnreadOnly(e.target.checked);
                  }}
                  className="accent-cyan-500"
                />
                Unread only
              </label>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">Current filter: {selectedTypeLabel}</p>
        </section>

        <section className="bg-primary-darker border border-cyan-500/20 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/5">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading notifications...</div>
          ) : error ? (
            <div className="p-10 text-center text-red-300">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No notifications found for this filter.</div>
          ) : (
            <div>
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border-b border-cyan-500/10 last:border-b-0 ${item.isRead ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      onClick={() => goToRequestFromNotification(item)}
                      className="text-left flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base font-semibold text-gray-100 truncate">{item.title}</p>
                        {!item.isRead && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{item.message}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">{item.type}</span>
                        <span className="text-gray-500">{timeAgo(item.createdAt)}</span>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      {!item.isRead && (
                        <button
                          onClick={() => handleMarkRead(item.id)}
                          className="px-2.5 py-1.5 text-xs rounded-md border border-green-500/25 text-green-300 hover:bg-green-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={pendingIds.includes(item.id) || markAllPending}
                        >
                          {pendingIds.includes(item.id) ? 'Saving...' : 'Mark read'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border border-red-500/25 text-red-300 hover:bg-red-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={pendingIds.includes(item.id) || markAllPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {pendingIds.includes(item.id) ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-5 flex items-center justify-between text-sm">
          <p className="text-gray-400">
            Page {page} of {Math.max(totalPages, 1)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-md border border-cyan-500/25 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-500/10"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, Math.max(totalPages, 1)))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-md border border-cyan-500/25 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-500/10"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;
