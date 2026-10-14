import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, FileText, AlertTriangle, IndianRupee, ShieldAlert } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ClientNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true, read: true } : n));
    } catch (err) {
      // quiet fail
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'delivery_submitted':
        return <FileText className="w-5 h-5 text-indigo-500" />;
      case 'payment_held':
      case 'payment_released':
        return <IndianRupee className="w-5 h-5 text-emerald-500" />;
      case 'dispute_opened':
      case 'dispute_resolved':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Real-time alerts for project milestones, escrow payments, and submissions.</p>
        </div>
        {notifications.some(n => !n.isRead && !n.read) && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No notifications yet</p>
            <p className="text-xs mt-1">Updates regarding your projects and milestone events will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => {
              const isUnread = !notif.isRead && !notif.read;
              const notifId = notif._id || notif.id;
              return (
                <div
                  key={notifId}
                  onClick={() => markAsRead(notifId)}
                  className={`p-5 flex items-start cursor-pointer transition-colors hover:bg-gray-50 ${isUnread ? 'bg-indigo-50/20' : ''}`}
                >
                  {isUnread && (
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 mr-3 shrink-0"></div>
                  )}
                  <div className={`p-2.5 rounded-full bg-white border border-gray-100 shadow-sm shrink-0 ${!isUnread ? 'ml-5' : ''}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className={`text-sm ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
