import * as notifService from '../services/notificationService.js';
import { sendSuccess } from '../utils/response.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const notifications = await notifService.getNotifications(userId);
    sendSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const count = await notifService.getUnreadCount(userId);
    sendSuccess(res, { count, unreadCount: count });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const notification = await notifService.markAsRead(req.params.id, userId);
    sendSuccess(res, notification);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const result = await notifService.markAllAsRead(userId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};
