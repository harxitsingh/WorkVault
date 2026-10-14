import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { formatDate } from '../../utils/formatters';
import { Bell, CheckCircle, Clock, AlertCircle, Check, MessageSquare, CreditCard, Star } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function FreelancerNotifications() {
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

  const getIcon = (type) => {
    switch (type) {
      case 'deal_created':
        return <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full"><AlertCircle size={20} /></div>;
      case 'delivery_submitted':
        return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><CheckCircle size={20} /></div>;
      case 'deal_completed':
      case 'payment_released':
        return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full"><CreditCard size={20} /></div>;
      case 'payment_held':
        return <div className="p-2 bg-amber-100 text-amber-600 rounded-full"><CreditCard size={20} /></div>;
      case 'review_received':
        return <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full"><Star size={20} /></div>;
      default:
        return <div className="p-2 bg-slate-100 text-slate-600 rounded-full"><Bell size={20} /></div>;
    }
  };

  const markAllAsRead = async () => {
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500">Stay updated on your orders, escrow funding, and payouts.</p>
        </div>
        {notifications.some(n => !n.isRead && !n.read) && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="flex items-center gap-2">
            <Check size={16} />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      <Card className="divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell size={40} className="mx-auto mb-3 opacity-40 text-slate-300" />
            <p className="text-base font-medium text-slate-700">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">We will notify you when a client creates an order or funds escrow.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isUnread = !notif.isRead && !notif.read;
            const notifId = notif._id || notif.id;
            return (
              <div
                key={notifId}
                onClick={() => markAsRead(notifId)}
                className={`p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                  isUnread ? 'bg-indigo-50/20' : ''
                }`}
              >
                <div className="shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm ${isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap ml-2">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                </div>
                {isUnread && (
                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0"></div>
                )}
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
