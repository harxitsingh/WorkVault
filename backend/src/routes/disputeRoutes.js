import { Router } from 'express';
import * as disputeController from '../controllers/disputeController.js';
import { createDisputeValidator, updateDisputeStatusValidator } from '../validators/disputeValidator.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// POST /api/disputes - Open dispute
router.post('/', requireAuth, createDisputeValidator, validateRequest, disputeController.create);

// GET /api/disputes - Get user's disputes (or all for admin)
router.get('/', requireAuth, disputeController.getAll);

// GET /api/disputes/:id - Get dispute by ID
router.get('/:id', requireAuth, disputeController.getById);

// POST /api/disputes/:id/evidence - Submit evidence
router.post('/:id/evidence', requireAuth, disputeController.addEvidence);

// POST /api/disputes/:id/resolve - Admin resolution (Refund client or release freelancer)
router.post('/:id/resolve', requireAuth, requireRole('admin'), disputeController.resolve);

// PUT /api/disputes/:id/status - Status update (Admin)
router.put('/:id/status', requireAuth, requireRole('admin'), updateDisputeStatusValidator, validateRequest, disputeController.updateStatus);

export default router;
