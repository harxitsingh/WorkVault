import api from './api';

const getErrorMessage = (error, fallback) => (
  error.response?.data?.message || error.message || fallback
);

export const notificationService = {
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch notifications'));
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to mark notification as read'));
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.patch('/notifications/read-all');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to mark all as read'));
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      const data = response.data?.data || response.data || {};
      return data.unreadCount ?? data.count ?? 0;
    } catch {
      return 0;
    }
  }
};

export default notificationService;
