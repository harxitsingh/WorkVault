import { Notification } from '../models/Notification.js';
import mongoose from 'mongoose';

/**
 * Get notifications for a user
 */
export const getNotifications = async (userId) => {
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50);
  return notifications.map(n => n.toJSON());
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, read: false });
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }
  if (notification.user.toString() !== userId.toString()) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    throw error;
  }
  notification.read = true;
  await notification.save();
  return notification.toJSON();
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, read: false }, { read: true });
  return { success: true };
};
