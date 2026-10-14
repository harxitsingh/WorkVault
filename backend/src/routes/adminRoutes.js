import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/users
router.get('/users', adminController.getUsers);

// GET /api/admin/services
router.get('/services', adminController.getServices);

// GET /api/admin/deals
router.get('/deals', adminController.getDeals);

// GET /api/admin/transactions
router.get('/transactions', adminController.getTransactions);

// GET /api/admin/disputes
router.get('/disputes', adminController.getDisputes);

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', adminController.updateUserStatus);

// PUT /api/admin/disputes/:id/resolve
router.put('/disputes/:id/resolve', adminController.resolveDispute);

export default router;
