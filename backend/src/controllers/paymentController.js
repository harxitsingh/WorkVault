import * as stripeService from '../services/stripeService.js';
import * as razorpayService from '../services/razorpayService.js';
import * as paymentGatewayService from '../services/paymentGatewayService.js';
import * as milestoneService from '../services/milestoneService.js';
import { sendSuccess } from '../utils/response.js';

export const getGatewayStatus = async (req, res, next) => {
  try {
    const status = paymentGatewayService.getGatewayStatus();
    return sendSuccess(res, status);
  } catch (error) {
    next(error);
  }
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { milestoneId, successUrl, cancelUrl } = req.body;
    if (!milestoneId) {
      const error = new Error('Milestone ID is required');
      error.statusCode = 400;
      throw error;
    }

    const session = await stripeService.createCheckoutSession(
      { milestoneId, successUrl, cancelUrl },
      req.user
    );
    return sendSuccess(res, session, 'Checkout session created successfully');
  } catch (error) {
    next(error);
  }
};

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { milestoneId, currency } = req.body;
    if (!milestoneId) {
      const error = new Error('Milestone ID is required');
      error.statusCode = 400;
      throw error;
    }

    const order = await razorpayService.createRazorpayOrder({ milestoneId, currency }, req.user);
    return sendSuccess(res, order, 'Razorpay order created successfully');
  } catch (error) {
    next(error);
  }
};

export const confirmRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, milestoneId } = req.body;
    if (!milestoneId) {
      const error = new Error('Milestone ID is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await razorpayService.confirmRazorpayPayment(
      { orderId, paymentId, signature, milestoneId },
      req.user
    );
    return sendSuccess(res, result, 'Milestone escrow payment confirmed successfully');
  } catch (error) {
    next(error);
  }
};

export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || req.body;
    const result = await razorpayService.handleRazorpayWebhook(rawBody, sig);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Razorpay Webhook Error]', error);
    return res.status(400).json({ error: error.message });
  }
};

export const confirmTestPayment = async (req, res, next) => {
  try {
    const { milestoneId, paymentReference } = req.body;
    if (!milestoneId) {
      const error = new Error('Milestone ID is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await milestoneService.fundMilestone(
      milestoneId,
      req.user,
      paymentReference || `test_intent_${Date.now()}`
    );
    return sendSuccess(res, result, 'Milestone funded successfully');
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const rawBody = req.rawBody || req.body;
    const result = await stripeService.handleWebhookEvent(rawBody, sig);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Stripe Webhook Error]', error);
    return res.status(400).json({ error: error.message });
  }
};
