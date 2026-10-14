import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All notification routes require auth
router.use(requireAuth);

// GET /api/notifications
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread-count
router.get('/unread-count', notificationController.getUnreadCount);

// PUT /api/notifications/read-all
router.put('/read-all', notificationController.markAllAsRead);

// PUT /api/notifications/:id/read
router.put('/:id/read', notificationController.markAsRead);

export default router;
