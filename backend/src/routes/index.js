import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import dealRoutes from './dealRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import disputeRoutes from './disputeRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import adminRoutes from './adminRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import milestoneRoutes from './milestoneRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import withdrawalRoutes from './withdrawalRoutes.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { upload, handleUploadError, uploadSingleImageOrFile } from '../middleware/uploadMiddleware.js';
import * as utilController from '../controllers/utilController.js';

const router = Router();

// Core entity routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/deals', dealRoutes);
router.use('/transactions', transactionRoutes);
router.use('/disputes', disputeRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

// Milestone & Payment & Withdrawal routes
router.use('/payments', paymentRoutes);
router.use('/withdrawals', withdrawalRoutes);
router.use('/', milestoneRoutes);

// Search
router.get('/search', requireAuth, utilController.search);

// File / Image upload (accepts image, service_images, file, etc.)
router.post('/upload', requireAuth, uploadSingleImageOrFile, utilController.uploadImage);

// Trust metrics
router.get('/stats/trust', requireAuth, utilController.getTrustMetrics);
router.get('/users/:id/trust-metrics', requireAuth, utilController.getTrustMetrics);

// Dashboard stats endpoints
router.get('/stats/freelancer', requireAuth, utilController.getFreelancerStats);
router.get('/stats/client', requireAuth, utilController.getClientStats);
router.get('/stats/admin', requireAuth, requireRole('admin'), utilController.getAdminStats);

// Statement download & withdrawal endpoints
router.get('/transactions/statement', requireAuth, utilController.downloadStatement);
router.post('/transactions/withdraw', requireAuth, utilController.withdrawFunds);

export default router;
