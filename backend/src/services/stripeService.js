import Stripe from 'stripe';
import mongoose from 'mongoose';
import { Milestone } from '../models/Milestone.js';
import { Deal } from '../models/Deal.js';
import { Transaction } from '../models/Transaction.js';
import { createNotification } from '../utils/notificationHelper.js';

/**
 * Returns configured Stripe client instance.
 * Throws clean error if STRIPE_SECRET_KEY is missing.
 */
export const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    const error = new Error('STRIPE_SECRET_KEY is not configured in environment variables');
    error.statusCode = 500;
    throw error;
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16'
  });
};

/**
 * Create Stripe Checkout Session for Milestone Funding
 * Server-side amount validation strictly from MongoDB (never from frontend).
 */
export const createCheckoutSession = async ({ milestoneId, successUrl, cancelUrl }, user) => {
  if (!milestoneId || !mongoose.Types.ObjectId.isValid(milestoneId)) {
    const error = new Error('Invalid or missing Milestone ID');
    error.statusCode = 400;
    throw error;
  }

  const milestone = await Milestone.findById(milestoneId).populate({
    path: 'deal',
    populate: [
      { path: 'client', select: 'name email _id' },
      { path: 'freelancer', select: 'name email _id' }
    ]
  });

  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }

  const deal = milestone.deal;
  if (!deal) {
    const error = new Error('Associated deal not found for this milestone');
    error.statusCode = 404;
    throw error;
  }

  const clientIdStr = deal.client?._id ? deal.client._id.toString() : deal.client?.toString();
  const freelancerIdStr = deal.freelancer?._id ? deal.freelancer._id.toString() : deal.freelancer?.toString();
  const userIdStr = (user.id || user._id).toString();

  // Authorization: Only the deal client can fund
  if (user.role === 'freelancer' || freelancerIdStr === userIdStr) {
    const error = new Error('Freelancers cannot fund milestones. Only the deal client can fund this milestone.');
    error.statusCode = 403;
    throw error;
  }

  if (clientIdStr !== userIdStr && user.role !== 'admin') {
    const error = new Error('Only the deal client can fund this milestone');
    error.statusCode = 403;
    throw error;
  }

  const currentStatus = (milestone.status || '').toUpperCase();
  if (currentStatus !== 'PENDING') {
    const error = new Error(`Cannot fund milestone in status: ${milestone.status}. Must be PENDING.`);
    error.statusCode = 400;
    throw error;
  }

  if (!milestone.amount || milestone.amount <= 0) {
    const error = new Error('Milestone amount must be greater than zero');
    error.statusCode = 400;
    throw error;
  }

  const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const finalSuccessUrl = successUrl || `${clientBaseUrl}/client/deals/${deal._id}?funded=true&milestoneId=${milestone._id}&session_id={CHECKOUT_SESSION_ID}`;
  const finalCancelUrl = cancelUrl || `${clientBaseUrl}/client/deals/${deal._id}?cancelled=true&milestoneId=${milestone._id}`;

  const stripe = getStripeClient();

  // Stripe INR amount in smallest currency unit (paise)
  const unitAmountInPaise = Math.round(milestone.amount * 100);

  const freelancerId = deal.freelancer?._id ? deal.freelancer._id.toString() : (deal.freelancer?.toString() || '');

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Milestone: ${milestone.title}`,
              description: `WorkVault Escrow funding for deal: "${deal.title}"`
            },
            unit_amount: unitAmountInPaise
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      client_reference_id: userIdStr,
      customer_email: user.email || deal.client?.email,
      metadata: {
        milestoneId: milestone._id.toString(),
        dealId: deal._id.toString(),
        clientId: userIdStr,
        freelancerId: freelancerId,
        amount: milestone.amount.toString()
      }
    });
  } catch (stripeErr) {
    console.error('[Stripe Checkout Session Error]:', stripeErr.message);
    const error = new Error(`Stripe Checkout error: ${stripeErr.message}`);
    error.statusCode = stripeErr.statusCode || 400;
    throw error;
  }

  milestone.stripeCheckoutSessionId = session.id;
  await milestone.save();

  return {
    sessionId: session.id,
    url: session.url,
    milestoneId: milestone._id,
    amount: milestone.amount,
    currency: 'INR'
  };
};

/**
 * Process Successful Stripe Payment (Webhook or Verified Confirmation)
 * Idempotent: checks paymentReference / referenceId / milestone status before executing.
 */
export const processPaymentSuccess = async ({
  milestoneId,
  dealId,
  amount,
  paymentReference,
  stripeSessionId = '',
  stripePaymentIntentId = '',
  clientId,
  freelancerId,
  paymentProvider = 'stripe'
}) => {
  if (!milestoneId) {
    throw new Error('Milestone ID is required to process payment success');
  }

  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    throw new Error(`Milestone ${milestoneId} not found during payment processing`);
  }

  const effectiveRef = paymentReference || stripePaymentIntentId || stripeSessionId || `ref_${Date.now()}`;

  // Idempotency check 1: see if transaction already exists for this reference or session
  const existingTx = await Transaction.findOne({
    $or: [
      { referenceId: effectiveRef },
      { paymentReference: effectiveRef },
      ...(stripeSessionId ? [{ stripeSessionId }] : []),
      ...(stripePaymentIntentId ? [{ stripePaymentIntentId }] : []),
      { milestone: milestone._id, type: 'PAYMENT_FUNDED' }
    ]
  });

  if (existingTx) {
    console.log(`[Stripe Webhook] Duplicate payment event ignored for milestone ${milestoneId}, reference ${effectiveRef}`);
    return { duplicate: true, transaction: existingTx, milestone };
  }

  const deal = await Deal.findById(dealId || milestone.deal);

  const targetClientId = clientId || deal?.client?._id || deal?.client;
  const targetFreelancerId = freelancerId || deal?.freelancer?._id || deal?.freelancer;
  const finalAmount = amount || milestone.amount;

  // Transition milestone to FUNDED
  milestone.status = 'FUNDED';
  milestone.stripePaymentIntentId = stripePaymentIntentId || (effectiveRef.startsWith('pi_') ? effectiveRef : '');
  if (stripeSessionId) {
    milestone.stripeCheckoutSessionId = stripeSessionId;
  }
  await milestone.save();

  // Create immutable Ledger Transaction in HELD status (escrow)
  const transaction = await Transaction.create({
    deal: deal?._id || milestone.deal,
    milestone: milestone._id,
    client: targetClientId,
    freelancer: targetFreelancerId,
    user: targetClientId,
    amount: finalAmount,
    currency: 'INR',
    type: 'PAYMENT_FUNDED',
    status: 'HELD',
    paymentProvider,
    stripeSessionId: stripeSessionId || '',
    stripePaymentIntentId: stripePaymentIntentId || (effectiveRef.startsWith('pi_') ? effectiveRef : ''),
    paymentReference: effectiveRef,
    referenceId: effectiveRef,
    description: `Escrow payment funded via Stripe for milestone: "${milestone.title}"`
  });

  // Advance deal to FUNDED or IN_PROGRESS if was CREATED
  if (deal && ['CREATED', 'pending'].includes(deal.status)) {
    deal.status = 'FUNDED';
    await deal.save();
  }

  // Send notification to freelancer
  if (targetFreelancerId) {
    createNotification({
      userId: targetFreelancerId,
      type: 'payment_held',
      title: 'Escrow Funded via Stripe 💳',
      message: `₹${finalAmount.toLocaleString('en-IN')} escrow deposited for milestone "${milestone.title}"`,
      link: `/freelancer/deals/${deal?._id || milestone.deal}`,
      relatedDeal: deal?._id || milestone.deal
    });
  }

  return { duplicate: false, transaction, milestone };
};

/**
 * Handle Stripe Webhook Event
 * Verifies webhook signature against raw body when secret is configured.
 */
export const handleWebhookEvent = async (rawBody, signature) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  const isRealSecret = webhookSecret && !webhookSecret.includes('placeholder');

  if (isRealSecret) {
    if (!signature) {
      const error = new Error('Missing stripe-signature header');
      error.statusCode = 400;
      throw error;
    }

    try {
      const stripe = getStripeClient();
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      const error = new Error(`Webhook signature verification failed: ${err.message}`);
      error.statusCode = 400;
      throw error;
    }
  } else {
    // If webhook secret is not configured or in test mode without secret
    if (signature && webhookSecret) {
      try {
        const stripe = getStripeClient();
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err) {
        // Fallback for mock test payloads if signature is invalid
        console.warn('[Stripe Webhook] Signature verification warning (development mode):', err.message);
        event = typeof rawBody === 'string'
          ? JSON.parse(rawBody)
          : (Buffer.isBuffer(rawBody) ? JSON.parse(rawBody.toString('utf8')) : rawBody);
      }
    } else {
      event = typeof rawBody === 'string'
        ? JSON.parse(rawBody)
        : (Buffer.isBuffer(rawBody) ? JSON.parse(rawBody.toString('utf8')) : rawBody);
    }
  }

  // Handle Stripe events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const metadata = session.metadata || {};
      const milestoneId = metadata.milestoneId;
      const dealId = metadata.dealId;
      const amount = metadata.amount
        ? parseFloat(metadata.amount)
        : (session.amount_total ? session.amount_total / 100 : 0);

      const paymentReference = session.payment_intent || session.id;
      const stripePaymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent?.id || '');

      if (milestoneId) {
        await processPaymentSuccess({
          milestoneId,
          dealId,
          amount,
          paymentReference,
          stripeSessionId: session.id,
          stripePaymentIntentId,
          clientId: metadata.clientId,
          freelancerId: metadata.freelancerId,
          paymentProvider: 'stripe'
        });
      }
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata || {};
      const milestoneId = metadata.milestoneId;
      if (milestoneId) {
        await processPaymentSuccess({
          milestoneId,
          dealId: metadata.dealId,
          amount: metadata.amount ? parseFloat(metadata.amount) : paymentIntent.amount / 100,
          paymentReference: paymentIntent.id,
          stripePaymentIntentId: paymentIntent.id,
          clientId: metadata.clientId,
          freelancerId: metadata.freelancerId,
          paymentProvider: 'stripe'
        });
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.warn(`[Stripe] Payment failed for payment_intent ${paymentIntent.id}`);
      break;
    }

    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }

  return { received: true, eventType: event.type };
};
