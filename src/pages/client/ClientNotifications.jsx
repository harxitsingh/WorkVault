import React, { useState, useEffect } from 'react';
import { Bell, FileText, AlertTriangle, Check, Wallet } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function ClientNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
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
      console.error('Failed to mark all as read:', err);
      toast.error('Failed to mark all as read');
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'delivery_submitted':
        return (
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
      case 'payment_held':
      case 'payment_released':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
        );
      case 'dispute_opened':
      case 'dispute_resolved':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const hasUnread = notifications.some(n => !n.isRead && !n.read);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Activity Alerts</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time alerts for project milestones, escrow deposits, and deliveries.</p>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            className="gap-1.5 text-xs font-bold self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="Updates regarding your freelance projects and milestone events will appear here."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => {
              const isUnread = !notif.isRead && !notif.read;
              const notifId = notif._id || notif.id;
              return (
                <div
                  key={notifId}
                  onClick={() => markAsRead(notifId)}
                  className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer transition-colors hover:bg-slate-50/80 ${
                    isUnread ? 'bg-primary/5' : ''
                  }`}
                >
                  {getIcon(notif.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className={`text-sm ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {isUnread && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
