import * as stripeService from './stripeService.js';
import * as razorpayService from './razorpayService.js';

export const getGatewayStatus = () => {
  return {
    stripe: {
      configured: Boolean(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')),
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      currency: process.env.CURRENCY || 'INR'
    },
    razorpay: {
      configured: razorpayService.isRazorpayConfigured(),
      keyId: process.env.RAZORPAY_KEY_ID || '',
      currency: process.env.CURRENCY || 'INR'
    }
  };
};

export const createMilestoneCheckout = async ({ milestoneId, provider = 'stripe', successUrl, cancelUrl }, user) => {
  if (provider === 'razorpay') {
    return await razorpayService.createRazorpayOrder({ milestoneId }, user);
  }
  return await stripeService.createCheckoutSession({ milestoneId, successUrl, cancelUrl }, user);
};

export const confirmMilestonePayment = async ({ provider = 'stripe', ...data }, user) => {
  if (provider === 'razorpay') {
    return await razorpayService.confirmRazorpayPayment(data, user);
  }
  // For test or standard confirmation
  const milestoneService = await import('./milestoneService.js');
  return await milestoneService.fundMilestone(data.milestoneId, user, data.paymentReference);
};
