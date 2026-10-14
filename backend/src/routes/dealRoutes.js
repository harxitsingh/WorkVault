import { Router } from 'express';
import * as dealController from '../controllers/dealController.js';
import { createDealValidator, updateDealStatusValidator } from '../validators/dealValidator.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/deals
router.post('/', requireAuth, createDealValidator, validateRequest, dealController.create);

// GET /api/deals
router.get('/', requireAuth, dealController.getAll);

// GET /api/deals/:id
router.get('/:id', requireAuth, dealController.getById);

// PUT /api/deals/:id/status
router.put('/:id/status', requireAuth, updateDealStatusValidator, validateRequest, dealController.updateStatus);

// POST /api/deals/:id/submit
router.post('/:id/submit', requireAuth, dealController.submit);

// POST /api/deals/:id/approve
router.post('/:id/approve', requireAuth, dealController.approve);

// POST /api/deals/:id/cancel
router.post('/:id/cancel', requireAuth, dealController.cancel);

export default router;
