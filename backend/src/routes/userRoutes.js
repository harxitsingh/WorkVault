import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/users/:id
router.get('/:id', userController.getUser);

// PUT /api/users/:id (auth required)
router.put('/:id', requireAuth, userController.updateUser);

// GET /api/users/:id/services
router.get('/:id/services', userController.getUserServices);

// GET /api/users/:id/reviews
router.get('/:id/reviews', userController.getUserReviews);

export default router;
