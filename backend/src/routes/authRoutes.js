import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// POST /api/auth/register
router.post('/register', authLimiter, registerValidator, validateRequest, authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidator, validateRequest, authController.login);

// GET /api/auth/me
router.get('/me', requireAuth, authController.getMe);

// POST /api/auth/switch-role
router.post('/switch-role', requireAuth, authController.switchRole);

export default router;
