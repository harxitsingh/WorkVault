import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { createReviewValidator } from '../validators/reviewValidator.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/reviews
router.post('/', requireAuth, createReviewValidator, validateRequest, reviewController.create);

// GET /api/reviews - Get reviews with optional filters (serviceId, targetUser, clientId)
router.get('/', reviewController.getAll);

// GET /api/reviews/service/:serviceId
router.get('/service/:serviceId', reviewController.getByServiceId);

// GET /api/reviews/:userId
router.get('/:userId', reviewController.getByUserId);

export default router;
