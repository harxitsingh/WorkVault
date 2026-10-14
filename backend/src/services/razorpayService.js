import crypto from 'crypto';
import { Milestone } from '../models/Milestone.js';
import { Deal } from '../models/Deal.js';
import { Transaction } from '../models/Transaction.js';
import { createNotification } from '../utils/notificationHelper.js';

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

/**
 * Checks if real Razorpay credentials are configured
 */
export const isRazorpayConfigured = () => {
  return Boolean(keyId && keySecret && !keyId.includes('placeholder'));
};

/**
 * Create a Razorpay Order for milestone escrow funding
 */
export const createRazorpayOrder = async ({ milestoneId, currency = 'INR' }, user) => {
  const milestone = await Milestone.findById(milestoneId).populate({
    path: 'deal',
    populate: [
      { path: 'client', select: 'name email' },
      { path: 'freelancer', select: 'name email' }
    ]
  });

  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }

  const deal = milestone.deal;
  const clientIdStr = deal?.client?._id ? deal.client._id.toString() : deal?.client?.toString();
  const userIdStr = (user.id || user._id).toString();

  if (clientIdStr !== userIdStr && user.role !== 'admin') {
    const error = new Error('Only the deal client can fund this milestone');
    error.statusCode = 403;
    throw error;
  }

  const amountInPaise = Math.round(milestone.amount * 100);
  const receipt = `rcpt_${milestone._id.toString().substring(0, 10)}_${Date.now()}`;

  if (isRazorpayConfigured()) {
    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: currency.toUpperCase(),
          receipt,
          notes: {
            milestoneId: milestone._id.toString(),
            dealId: deal._id.toString(),
            clientId: userIdStr,
            freelancerId: (deal.freelancer?._id || deal.freelancer).toString()
          }
        })
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error?.description || 'Razorpay order creation failed');
      }

      milestone.razorpayOrderId = orderData.id;
      await milestone.save();

      return {
        orderId: orderData.id,
        amount: milestone.amount,
        amountInPaise,
        currency: orderData.currency,
        keyId,
        milestoneId: milestone._id,
        isSimulated: false
      };
    } catch (err) {
      console.warn('[Razorpay API Error, falling back to simulated order for local dev]:', err.message);
    }
  }

  // Local development / simulated gateway fallback
  const mockOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  milestone.razorpayOrderId = mockOrderId;
  await milestone.save();

  return {
    orderId: mockOrderId,
    amount: milestone.amount,
    amountInPaise,
    currency: currency.toUpperCase(),
    keyId: keyId || 'rzp_test_simulated_key',
    milestoneId: milestone._id,
    isSimulated: true,
    notice: 'Simulated mode: Set RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env for live gateway'
  };
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!isRazorpayConfigured()) {
    return true;
  }
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Confirm and process verified Razorpay payment into Escrow (HELD status)
 */
export const confirmRazorpayPayment = async ({ orderId, paymentId, signature, milestoneId }, user) => {
  const isSignatureValid = verifyPaymentSignature({ orderId, paymentId, signature });
  if (!isSignatureValid) {
    const error = new Error('Invalid Razorpay payment signature');
    error.statusCode = 400;
    throw error;
  }

  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }

  const deal = await Deal.findById(milestone.deal);
  const referenceId = paymentId || `pay_rzp_${Date.now()}`;

  // Idempotency check
  const existingTx = await Transaction.findOne({
    referenceId,
    type: 'PAYMENT_FUNDED'
  });
  if (existingTx) {
    return { duplicate: true, transaction: existingTx, milestone };
  }

  milestone.status = 'FUNDED';
  milestone.razorpayPaymentId = referenceId;
  await milestone.save();

  const transaction = await Transaction.create({
    deal: deal?._id || milestone.deal,
    milestone: milestone._id,
    client: deal?.client || user._id,
    freelancer: deal?.freelancer,
    user: user._id || user.id,
    amount: milestone.amount,
    currency: 'INR',
    type: 'PAYMENT_FUNDED',
    status: 'HELD',
    paymentReference: referenceId,
    referenceId,
    description: `Escrow payment funded via Razorpay for milestone: "${milestone.title}"`,
    metadata: {
      gateway: 'razorpay',
      orderId,
      paymentId: referenceId
    }
  });

  if (deal && ['CREATED', 'pending'].includes(deal.status)) {
    deal.status = 'FUNDED';
    await deal.save();
  }

  if (deal?.freelancer) {
    createNotification({
      userId: deal.freelancer,
      type: 'payment_held',
      title: 'Escrow Funded via Razorpay 💳',
      message: `₹${milestone.amount.toLocaleString('en-IN')} escrow deposited for milestone "${milestone.title}"`,
      link: `/freelancer/deals/${deal._id}`,
      relatedDeal: deal._id
    });
  }

  return { duplicate: false, transaction, milestone };
};

/**
 * Handle incoming Razorpay Webhook Event
 */
export const handleRazorpayWebhook = async (rawBody, signature) => {
  if (webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
      .digest('hex');

    if (expectedSignature !== signature) {
      const error = new Error('Razorpay webhook signature verification failed');
      error.statusCode = 400;
      throw error;
    }
  }

  const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
  const eventName = event.event;

  if (eventName === 'payment.captured' || eventName === 'order.paid') {
    const payment = event.payload?.payment?.entity || {};
    const notes = payment.notes || {};
    const milestoneId = notes.milestoneId;

    if (milestoneId) {
      const milestone = await Milestone.findById(milestoneId);
      if (milestone && milestone.status.toUpperCase() === 'PENDING') {
        const deal = await Deal.findById(milestone.deal);
        const referenceId = payment.id || `pay_rzp_hook_${Date.now()}`;

        milestone.status = 'FUNDED';
        milestone.razorpayPaymentId = referenceId;
        await milestone.save();

        await Transaction.create({
          deal: deal?._id || milestone.deal,
          milestone: milestone._id,
          client: deal?.client,
          freelancer: deal?.freelancer,
          user: deal?.client,
          amount: payment.amount ? payment.amount / 100 : milestone.amount,
          currency: payment.currency || 'INR',
          type: 'PAYMENT_FUNDED',
          status: 'HELD',
          paymentReference: referenceId,
          referenceId,
          description: `Escrow payment captured via Razorpay Webhook for milestone "${milestone.title}"`,
          metadata: { gateway: 'razorpay', event: eventName }
        });

        if (deal && ['CREATED', 'pending'].includes(deal.status)) {
          deal.status = 'FUNDED';
          await deal.save();
        }
      }
    }
  }

  return { status: 'ok', received: true };
};
