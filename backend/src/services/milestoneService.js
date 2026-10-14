import { Milestone } from '../models/Milestone.js';
import { Deal } from '../models/Deal.js';
import { Transaction } from '../models/Transaction.js';
import mongoose from 'mongoose';
import { createNotification } from '../utils/notificationHelper.js';

const helperFindDeal = async (dealId) => {
  if (mongoose.Types.ObjectId.isValid(dealId)) {
    return await Deal.findById(dealId)
      .populate('client', 'name email profileImage avatar')
      .populate('freelancer', 'name email profileImage avatar')
      .populate('service', 'title price category image');
  }
  return await Deal.findOne({ _id: dealId })
    .populate('client', 'name email profileImage avatar')
    .populate('freelancer', 'name email profileImage avatar')
    .populate('service', 'title price category image');
};

const helperFindMilestone = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await Milestone.findById(id).populate({
      path: 'deal',
      populate: [
        { path: 'client', select: 'name email profileImage avatar' },
        { path: 'freelancer', select: 'name email profileImage avatar' }
      ]
    });
  }
  return await Milestone.findOne({ _id: id }).populate({
    path: 'deal',
    populate: [
      { path: 'client', select: 'name email profileImage avatar' },
      { path: 'freelancer', select: 'name email profileImage avatar' }
    ]
  });
};

/**
 * Valid Milestone State Transitions
 */
const VALID_MILESTONE_TRANSITIONS = {
  PENDING: ['FUNDED', 'CANCELLED'],
  FUNDED: ['IN_PROGRESS', 'CANCELLED', 'DISPUTED'],
  IN_PROGRESS: ['SUBMITTED', 'CANCELLED', 'DISPUTED'],
  SUBMITTED: ['APPROVED', 'IN_PROGRESS', 'DISPUTED'], // IN_PROGRESS when revision requested
  APPROVED: ['RELEASED'],
  RELEASED: [],
  DISPUTED: ['REFUNDED', 'RELEASED', 'IN_PROGRESS'], // Resolved by admin
  REFUNDED: [],
  CANCELLED: []
};

const isValidTransition = (current, next) => {
  const normCurrent = (current || '').toUpperCase();
  const normNext = (next || '').toUpperCase();
  const allowed = VALID_MILESTONE_TRANSITIONS[normCurrent];
  return allowed && allowed.includes(normNext);
};

/**
 * Create a new milestone for a deal (Client only)
 */
export const createMilestone = async (dealId, data, user) => {
  const deal = await helperFindDeal(dealId);
  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  const clientIdStr = deal.client?._id ? deal.client._id.toString() : deal.client?.toString();
  const userIdStr = (user.id || user._id).toString();

  if (clientIdStr !== userIdStr && user.role !== 'admin') {
    const error = new Error('Only the deal client can create milestones');
    error.statusCode = 403;
    throw error;
  }

  if (['CANCELLED', 'RELEASED', 'completed'].includes(deal.status)) {
    const error = new Error(`Cannot add milestones to a deal with status ${deal.status}`);
    error.statusCode = 400;
    throw error;
  }

  // Count existing milestones to determine order
  const existingCount = await Milestone.countDocuments({ deal: deal._id });

  const milestone = await Milestone.create({
    deal: deal._id,
    title: data.title,
    description: data.description || '',
    amount: parseFloat(data.amount),
    dueDate: data.dueDate || null,
    order: data.order || existingCount + 1,
    status: 'PENDING'
  });

  // Notify freelancer
  if (deal.freelancer) {
    const freelancerId = deal.freelancer._id || deal.freelancer;
    createNotification({
      userId: freelancerId,
      type: 'deal_created',
      title: 'New Milestone Created',
      message: `A new milestone "${milestone.title}" (₹${milestone.amount.toLocaleString('en-IN')}) was added to deal "${deal.title}"`,
      link: `/freelancer/deals/${deal._id}`,
      relatedDeal: deal._id
    });
  }

  const populated = await helperFindMilestone(milestone._id);
  return populated.toJSON();
};

/**
 * Get all milestones for a deal
 */
export const getMilestonesByDeal = async (dealId, user) => {
  const deal = await helperFindDeal(dealId);
  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  const clientIdStr = deal.client?._id ? deal.client._id.toString() : deal.client?.toString();
  const freelancerIdStr = deal.freelancer?._id ? deal.freelancer._id.toString() : deal.freelancer?.toString();
  const userIdStr = (user.id || user._id).toString();

  if (user.role !== 'admin' && clientIdStr !== userIdStr && freelancerIdStr !== userIdStr) {
    const error = new Error('You are not authorized to view milestones for this deal');
    error.statusCode = 403;
    throw error;
  }

  const milestones = await Milestone.find({ deal: deal._id }).sort({ order: 1, createdAt: 1 });
  return milestones.map(m => m.toJSON());
};

/**
 * Get milestone by ID
 */
export const getMilestoneById = async (id, user) => {
  const milestone = await helperFindMilestone(id);
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }

  const deal = milestone.deal;
  const clientIdStr = deal?.client?._id ? deal.client._id.toString() : deal?.client?.toString();
  const freelancerIdStr = deal?.freelancer?._id ? deal.freelancer._id.toString() : deal?.freelancer?.toString();
  const userIdStr = (user.id || user._id).toString();

  if (user.role !== 'admin' && clientIdStr !== userIdStr && freelancerIdStr !== userIdStr) {
    const error = new Error('You are not authorized to view this milestone');
    error.statusCode = 403;
    throw error;
  }

  return milestone.toJSON();
};

/**
 * Fund milestone (simulated or verified payment)
 */
export const fundMilestone = async (id, user, paymentReference = '') => {
  const milestone = await helperFindMilestone(id);
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }

  const deal = milestone.deal;
  const clientIdStr = deal?.client?._id ? deal.client._id.toString() : deal?.client?.toString();
  const freelancerIdStr = deal?.freelancer?._id ? deal.freelancer._id.toString() : deal?.freelancer?.toString();
  const userIdStr = (user.id || user._id).toString();

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

  const currentStatus = milestone.status.toUpperCase();
  if (currentStatus !== 'PENDING') {
    const error = new Error(`Cannot fund milestone in status ${milestone.status}. Must be PENDING.`);
    error.statusCode = 400;
    throw error;
  }

  milestone.status = 'FUNDED';
  milestone.stripePaymentIntentId = paymentReference || `ref_fund_${Date.now()}`;
  await milestone.save();

  // Create immutable transaction ledger record
  const transaction = await Transaction.create({
    deal: deal._id,
    milestone: milestone._id,
    client: deal.client._id || deal.client,
    freelancer: deal.freelancer._id || deal.freelancer,
    user: user._id || user.id,
    amount: milestone.amount,
    currency: 'INR',
    type: 'PAYMENT_FUNDED',
    status: 'HELD',
    paymentProvider: 'sandbox',
    paymentReference: milestone.stripePaymentIntentId,
    referenceId: milestone.stripePaymentIntentId,
    description: `Escrow funded for milestone: "${milestone.title}"`
  });

  // Update deal status to FUNDED / IN_PROGRESS if was CREATED
  if (['CREATED', 'pending'].includes(deal.status)) {
    deal.status = 'FUNDED';
    await deal.save();
  }

  // Notify freelancer
  if (deal.freelancer) {
    const freelancerId = deal.freelancer._id || deal.freelancer;
    createNotification({
      userId: freelancerId,
      type: 'payment_held',
      title: 'Milestone Funded',
      message: `Escrow of ₹${milestone.amount.toLocaleString('en-IN')} has been funded for milestone "${milestone.title}"`,
      link: `/freelancer/deals/${deal._id}`,
      relatedDeal: deal._id
    });
  }

  const updated = await helperFindMilestone(milestone._id);
  return { milestone: updated.toJSON(), transaction: transaction.toJSON() };
};

/**
 * Start work on milestone (Freelancer updates progress to IN_PROGRESS)
 */
export const startMilestoneWork = async (id, user) => {
  const milestone = await helperFindMilestone(id);
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }

  const deal = milestone.deal;
  const freelancerIdStr = deal?.freelancer?._id ? deal.freelancer._id.toString() : deal?.freelancer?.toString();
  const userIdStr = (user.id || user._id).toString();

  if (freelancerIdStr !== userIdStr && user.role !== 'admin') {
    const error = new Error('Only the assigned freelancer can start work on this milestone');
    error.statusCode = 403;
    throw error;
  }

  const currentStatus = milestone.status.toUpperCase();
  if (currentStatus !== 'FUNDED') {
    const error = new Error(`Cannot start work. Milestone must be FUNDED first (currently: ${milestone.status}).`);
    error.statusCode = 400;
    throw error;
  }

  milestone.status = 'IN_PROGRESS';
  await milestone.save();

  if (deal.status === 'FUNDED') {
    deal.status = 'IN_PROGRESS';
    await deal.save();
  }

  const updated = await helperFindMilestone(milestone._id);
  return updated.toJSON();
};

/**
 * Submit work for a milestone (Freelancer only)
 */
export const submitMilestoneWork = async (id, submissionData, user) => {
  const milestone = await helperFindMilestone(id);
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }

  const deal = milestone.deal;
  const freelancerIdStr = deal?.freelancer?._id ? deal.freelancer._id.toString() : deal?.freelancer?.toString();
  const userIdStr = (user.id || user._id).toString();

  if (freelancerIdStr !== userIdStr && user.role !== 'admin') {
    const error = new Error('Only the assigned freelancer can submit work');
    error.statusCode = 403;
    throw error;
  }

  const currentStatus = milestone.status.toUpperCase();
  if (!['FUNDED', 'IN_PROGRESS'].includes(currentStatus)) {
    const error = new Error(`Cannot submit work when milestone is in ${milestone.status} status. It must be FUNDED or IN_PROGRESS.`);
    error.statusCode = 400;
    throw error;
  }

  milestone.status = 'SUBMITTED';
  milestone.submittedAt = new Date();
  milestone.submission = {
    message: submissionData.message || '',
    files: submissionData.files || [],
    submittedBy: user._id || user.id,
    submittedAt: new Date(),
    status: 'SUBMITTED',
    revisionNotes: ''
  };

  await milestone.save();

  // If deal was not already submitted/in_progress, keep it synchronized
  if (['FUNDED', 'IN_PROGRESS'].includes(deal.status)) {
    deal.status = 'SUBMITTED';
    await deal.save();
  }

  // Notify client
  if (deal.client) {
    const clientId = deal.client._id || deal.client;
    createNotification({
      userId: clientId,
      type: 'delivery_submitted',
      title: 'Milestone Work Submitted',
      message: `Work has been submitted for milestone "${milestone.title}" on deal "${deal.title}"`,
      link: `/client/deals/${deal._id}`,
      relatedDeal: deal._id
    });
  }

  const updated = await helperFindMilestone(milestone._id);
  return updated.toJSON();
};

/**
 * Request revision on submitted work (Client only)
 */
export const requestMilestoneRevision = async (id, data, user) => {
  const milestone = await helperFindMilestone(id);
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }

  const deal = milestone.deal;
  const clientIdStr = deal?.client?._id ? deal.client._id.toString() : deal?.client?.toString();
  const userIdStr = (user.id || user._id).toString();

  if (clientIdStr !== userIdStr && user.role !== 'admin') {
    const error = new Error('Only the client can request revisions');
    error.statusCode = 403;
    throw error;
  }

  const currentStatus = milestone.status.toUpperCase();
  if (currentStatus !== 'SUBMITTED') {
    const error = new Error(`Cannot request revision on milestone in status ${milestone.status}. Must be SUBMITTED.`);
    error.statusCode = 400;
    throw error;
  }

  milestone.status = 'IN_PROGRESS';
  if (!milestone.submission) milestone.submission = {};
  milestone.submission.status = 'REVISION_REQUESTED';
  milestone.submission.revisionNotes = data.revisionNotes || data.notes || 'Please revise according to requirements';

  await milestone.save();

  // Notify freelancer
  if (deal.freelancer) {
    const freelancerId = deal.freelancer._id || deal.freelancer;
    createNotification({
      userId: freelancerId,
      type: 'deal_updated',
      title: 'Revision Requested',
      message: `Client requested a revision for milestone "${milestone.title}": ${milestone.submission.revisionNotes}`,
      link: `/freelancer/deals/${deal._id}`,
      relatedDeal: deal._id
    });
  }

  const updated = await helperFindMilestone(milestone._id);
  return updated.toJSON();
};

/**
 * Approve milestone work and release payment to freelancer
 */
export const approveAndReleaseMilestone = async (id, user) => {
  const milestone = await helperFindMilestone(id);
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }

  const deal = milestone.deal;
  const clientIdStr = deal?.client?._id ? deal.client._id.toString() : deal?.client?.toString();
  const freelancerIdStr = deal?.freelancer?._id ? deal.freelancer._id.toString() : deal?.freelancer?.toString();
  const userIdStr = (user.id || user._id).toString();

  if (freelancerIdStr === userIdStr && user.role !== 'admin') {
    const error = new Error('Freelancers cannot approve work or release payments to themselves');
    error.statusCode = 403;
    throw error;
  }

  if (clientIdStr !== userIdStr && user.role !== 'admin') {
    const error = new Error('Only the deal client or an admin can approve milestone work');
    error.statusCode = 403;
    throw error;
  }

  const currentStatus = milestone.status.toUpperCase();
  if (currentStatus === 'RELEASED') {
    const error = new Error('Milestone has already been released');
    error.statusCode = 400;
    throw error;
  }

  if (currentStatus === 'DISPUTED') {
    const error = new Error('Cannot approve or release a DISPUTED milestone. Dispute must be resolved by admin first.');
    error.statusCode = 400;
    throw error;
  }

  if (currentStatus !== 'SUBMITTED' && currentStatus !== 'APPROVED') {
    const error = new Error(`Cannot approve milestone in status ${milestone.status}. Must be SUBMITTED.`);
    error.statusCode = 400;
    throw error;
  }

  // Verify milestone was actually funded in escrow
  const fundedTx = await Transaction.findOne({
    milestone: milestone._id,
    type: { $in: ['PAYMENT_FUNDED', 'payment', 'escrow'] }
  });
  if (!fundedTx) {
    const error = new Error('Cannot release milestone: no escrow funding transaction found');
    error.statusCode = 400;
    throw error;
  }

  // Update original escrow funding transaction status to RELEASED
  if (fundedTx.status === 'HELD' || fundedTx.status === 'held') {
    fundedTx.status = 'RELEASED';
    await fundedTx.save();
  }

  const now = new Date();
  milestone.status = 'RELEASED';
  milestone.approvedAt = milestone.approvedAt || now;
  milestone.releasedAt = now;
  if (milestone.submission) {
    milestone.submission.status = 'ACCEPTED';
  }
  await milestone.save();

  // Platform fee calculation (10%)
  const platformFeeRate = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '10') / 100;
  const platformFeeAmount = Math.round(milestone.amount * platformFeeRate);
  const freelancerPayout = milestone.amount - platformFeeAmount;
  const paymentProvider = fundedTx.paymentProvider || 'stripe';

  // Create immutable Ledger transactions:
  // 1. Payment Released to Freelancer
  const releaseTx = await Transaction.create({
    deal: deal._id,
    milestone: milestone._id,
    client: deal.client._id || deal.client,
    freelancer: deal.freelancer._id || deal.freelancer,
    user: deal.freelancer._id || deal.freelancer,
    amount: freelancerPayout,
    fee: platformFeeAmount,
    currency: 'INR',
    type: 'PAYMENT_RELEASED',
    status: 'RELEASED',
    paymentProvider,
    referenceId: `rel_${milestone._id}_${Date.now()}`,
    description: `Funds released for milestone: "${milestone.title}" (Net: ₹${freelancerPayout}, Fee: ₹${platformFeeAmount})`
  });

  // 2. Platform Fee Ledger Entry
  await Transaction.create({
    deal: deal._id,
    milestone: milestone._id,
    client: deal.client._id || deal.client,
    freelancer: deal.freelancer._id || deal.freelancer,
    user: null, // Platform
    amount: platformFeeAmount,
    currency: 'INR',
    type: 'PLATFORM_FEE',
    status: 'COMPLETED',
    paymentProvider,
    referenceId: `fee_${milestone._id}_${Date.now()}`,
    description: `Platform fee (10%) collected on milestone: "${milestone.title}"`
  });

  // Check if ALL milestones for this deal are now RELEASED
  const remainingUnreleased = await Milestone.countDocuments({
    deal: deal._id,
    status: { $ne: 'RELEASED' }
  });

  if (remainingUnreleased === 0) {
    deal.status = 'RELEASED';
    deal.completedAt = now;
    await deal.save();
  } else {
    deal.status = 'IN_PROGRESS';
    await deal.save();
  }

  // Notify freelancer
  if (deal.freelancer) {
    const freelancerId = deal.freelancer._id || deal.freelancer;
    createNotification({
      userId: freelancerId,
      type: 'payment_released',
      title: 'Milestone Payment Released! 🎉',
      message: `₹${freelancerPayout.toLocaleString('en-IN')} has been released to your available balance for "${milestone.title}"`,
      link: `/freelancer/earnings`,
      relatedDeal: deal._id
    });
  }

  const updated = await helperFindMilestone(milestone._id);
  return { milestone: updated.toJSON(), transaction: releaseTx.toJSON() };
};
