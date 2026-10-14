import { Router } from 'express';
import * as serviceController from '../controllers/serviceController.js';
import { createServiceValidator, updateServiceValidator } from '../validators/serviceValidator.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// GET /api/services (public)
router.get('/', serviceController.getAll);

// GET /api/services/:id (public)
router.get('/:id', serviceController.getById);

// POST /api/services (freelancer only)
router.post('/', requireAuth, requireRole('freelancer'), createServiceValidator, validateRequest, serviceController.create);

// PUT /api/services/:id (owner only)
router.put('/:id', requireAuth, requireRole('freelancer'), updateServiceValidator, validateRequest, serviceController.update);

// DELETE /api/services/:id (owner or admin)
router.delete('/:id', requireAuth, serviceController.remove);

export default router;
