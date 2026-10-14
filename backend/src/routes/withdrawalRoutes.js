import { Router } from 'express';
import * as withdrawalController from '../controllers/withdrawalController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/balance', withdrawalController.getBalance);
router.post('/', withdrawalController.requestWithdrawal);
router.get('/', withdrawalController.getWithdrawals);

export default router;
