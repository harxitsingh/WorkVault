import { Router } from 'express';
import * as milestoneController from '../controllers/milestoneController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router({ mergeParams: true });

router.use('/deals', requireAuth);
router.use('/milestones', requireAuth);

// Milestone creation & retrieval for deals
router.post('/deals/:dealId/milestones', milestoneController.createMilestone);
router.get('/deals/:dealId/milestones', milestoneController.getMilestonesByDeal);

// Milestone lifecycle actions
router.get('/milestones/:id', milestoneController.getMilestoneById);
router.post('/milestones/:id/fund', milestoneController.fundMilestone);
router.post('/milestones/:id/start', milestoneController.startMilestoneWork);
router.post('/milestones/:id/submit', milestoneController.submitMilestoneWork);
router.post('/milestones/:id/revision', milestoneController.requestMilestoneRevision);
router.post('/milestones/:id/approve', milestoneController.approveAndReleaseMilestone);
router.post('/milestones/:id/release', milestoneController.approveAndReleaseMilestone);

export default router;
