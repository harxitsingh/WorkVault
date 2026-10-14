import { Router } from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { paymentLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Gateway status (Stripe, Razorpay, modes)
router.get('/status', requireAuth, paymentController.getGatewayStatus);

// Stripe Checkout Session creation (requires client auth)
router.post('/create-checkout-session', requireAuth, paymentLimiter, paymentController.createCheckoutSession);

// Razorpay Order creation & payment confirmation (requires client auth)
router.post('/create-razorpay-order', requireAuth, paymentLimiter, paymentController.createRazorpayOrder);
router.post('/confirm-razorpay-payment', requireAuth, paymentController.confirmRazorpayPayment);

// Test payment confirmation (development / test mode fallback)
router.post('/confirm-test-payment', requireAuth, paymentLimiter, paymentController.confirmTestPayment);

// Webhooks (must receive raw body, signature verification handled in controller)
router.post('/stripe/webhook', paymentController.handleWebhook);
router.post('/webhook', paymentController.handleWebhook);
router.post('/razorpay-webhook', paymentController.handleRazorpayWebhook);

export default router;
