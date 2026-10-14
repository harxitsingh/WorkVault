import { Router } from 'express';
import * as txController from '../controllers/transactionController.js';
import { createTransactionValidator } from '../validators/transactionValidator.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';

import * as utilController from '../controllers/utilController.js';

const router = Router();

// Specific subpaths must come BEFORE /:id
// GET /api/transactions/statement
router.get('/statement', requireAuth, utilController.downloadStatement);

// POST /api/transactions/withdraw
router.post('/withdraw', requireAuth, utilController.withdrawFunds);

// POST /api/transactions
router.post('/', requireAuth, createTransactionValidator, validateRequest, txController.create);

// GET /api/transactions
router.get('/', requireAuth, txController.getAll);

// GET /api/transactions/:id
router.get('/:id', requireAuth, txController.getById);

// POST /api/transactions/:id/fund
router.post('/:id/fund', requireAuth, txController.fund);

// POST /api/transactions/:id/release
router.post('/:id/release', requireAuth, txController.release);

// POST /api/transactions/:id/refund (admin only handled in service)
router.post('/:id/refund', requireAuth, txController.refund);

export default router;
