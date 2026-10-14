import { Notification } from '../models/Notification.js';

/**
 * Create a notification for a user. Fire-and-forget — errors are logged but not thrown.
 */
export const createNotification = async ({ userId, type, title, message, link, relatedDeal, relatedService }) => {
  try {
    await Notification.create({
      user: userId,
      type: type || 'general',
      title,
      message: message || '',
      link: link || '',
      relatedDeal: relatedDeal || null,
      relatedService: relatedService || null
    });
  } catch (error) {
    console.error('[Notification] Failed to create notification:', error.message);
  }
};
