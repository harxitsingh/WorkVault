import { Dispute } from '../models/Dispute.js';
import { Deal } from '../models/Deal.js';
import { Milestone } from '../models/Milestone.js';
import { Transaction } from '../models/Transaction.js';
import mongoose from 'mongoose';
import { createNotification } from '../utils/notificationHelper.js';

const helperFindDeal = async (dealId) => {
  if (mongoose.Types.ObjectId.isValid(dealId)) {
    return await Deal.findById(dealId)
      .populate('client', 'name email profileImage avatar')
      .populate('freelancer', 'name email profileImage avatar')
      .populate('service', 'title price category');
  }
  return await Deal.findOne({ _id: dealId })
    .populate('client', 'name email profileImage avatar')
    .populate('freelancer', 'name email profileImage avatar')
    .populate('service', 'title price category');
};

const helperFindDispute = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await Dispute.findById(id)
      .populate('deal')
      .populate('milestone')
      .populate('raisedBy', 'name email profileImage avatar')
      .populate('resolvedBy', 'name email');
  }
  return await Dispute.findOne({ _id: id })
    .populate('deal')
    .populate('milestone')
    .populate('raisedBy', 'name email profileImage avatar')
    .populate('resolvedBy', 'name email');
};

/**
 * Create a dispute for a deal or specific milestone
 */
export const createDispute = async (data, user) => {
  const deal = await helperFindDeal(data.dealId);
  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  const clientIdStr = deal.client?._id ? deal.client._id.toString() : deal.client?.toString();
  const freelancerIdStr = deal.freelancer?._id ? deal.freelancer._id.toString() : deal.freelancer?.toString();
  const userIdStr = (user.id || user._id).toString();

  // Only deal participants or admin can open disputes
  if (clientIdStr !== userIdStr && freelancerIdStr !== userIdStr && user.role !== 'admin') {
    const error = new Error('Only deal participants can open a dispute');
    error.statusCode = 403;
    throw error;
  }

  let milestone = null;
  if (data.milestoneId) {
    milestone = await Milestone.findById(data.milestoneId);
    if (!milestone) {
      const error = new Error('Specified milestone not found');
      error.statusCode = 404;
      throw error;
    }
  }

  // Check if active dispute already exists for this deal/milestone
  const query = {
    deal: deal._id,
    status: { $in: ['OPEN', 'UNDER_REVIEW', 'open', 'in_review'] }
  };
  if (milestone) query.milestone = milestone._id;

  const existing = await Dispute.findOne(query);
  if (existing) {
    const error = new Error('An active dispute already exists for this project/milestone');
    error.statusCode = 409;
    throw error;
  }

  const againstUser = userIdStr === clientIdStr ? deal.freelancer._id || deal.freelancer : deal.client._id || deal.client;

  const dispute = await Dispute.create({
    deal: deal._id,
    milestone: milestone ? milestone._id : null,
    raisedBy: user._id || user.id,
    againstUser,
    reason: data.reason,
    description: data.description || '',
    evidence: data.evidence || [],
    status: 'OPEN'
  });

  // Freeze milestone and deal
  if (milestone) {
    milestone.status = 'DISPUTED';
    milestone.dispute = dispute._id;
    await milestone.save();
  }
  deal.status = 'DISPUTED';
  await deal.save();

  // Notify other party
  createNotification({
    userId: againstUser,
    type: 'dispute_opened',
    title: 'Dispute Opened ⚠️',
    message: `A dispute has been raised on "${deal.title}" by ${user.name || 'a party'}: "${data.reason}"`,
    link: `/disputes/${dispute._id}`,
    relatedDeal: deal._id
  });

  const populated = await helperFindDispute(dispute._id);
  return populated.toJSON();
};

/**
 * Attach evidence to an open dispute
 */
export const addDisputeEvidence = async (disputeId, evidenceData, user) => {
  const dispute = await helperFindDispute(disputeId);
  if (!dispute) {
    const error = new Error('Dispute not found');
    error.statusCode = 404;
    throw error;
  }

  const deal = await helperFindDeal(dispute.deal?._id || dispute.deal);
  const clientIdStr = deal?.client?._id ? deal.client._id.toString() : deal?.client?.toString();
  const freelancerIdStr = deal?.freelancer?._id ? deal.freelancer._id.toString() : deal?.freelancer?.toString();
  const userIdStr = (user.id || user._id).toString();

  if (clientIdStr !== userIdStr && freelancerIdStr !== userIdStr && user.role !== 'admin') {
    const error = new Error('You are not authorized to add evidence to this dispute');
    error.statusCode = 403;
    throw error;
  }

  if (['RESOLVED', 'CLOSED', 'resolved', 'closed'].includes(dispute.status)) {
    const error = new Error('Cannot add evidence to an already resolved dispute');
    error.statusCode = 400;
    throw error;
  }

  dispute.evidence.push({
    url: evidenceData.url || evidenceData.fileUrl,
    fileName: evidenceData.fileName || 'Evidence Attachment',
    mimeType: evidenceData.mimeType || 'application/octet-stream',
    size: evidenceData.size || 0,
    uploadedBy: user._id || user.id,
    uploadedAt: new Date(),
    note: evidenceData.note || ''
  });

  if (dispute.status === 'OPEN') {
    dispute.status = 'UNDER_REVIEW';
  }

  await dispute.save();

  const populated = await helperFindDispute(dispute._id);
  return populated.toJSON();
};

/**
 * Get disputes for a user (or all for admin)
 */
export const getDisputes = async (user) => {
  const userIdStr = (user.id || user._id).toString();
  let disputes;

  if (user.role === 'admin') {
    disputes = await Dispute.find()
      .populate('deal')
      .populate('milestone')
      .populate('raisedBy', 'name email profileImage avatar')
      .populate('againstUser', 'name email profileImage avatar')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });
  } else {
    const userDeals = await Deal.find({
      $or: [{ client: userIdStr }, { freelancer: userIdStr }]
    }).select('_id');
    const dealIds = userDeals.map(d => d._id);

    disputes = await Dispute.find({
      $or: [
        { raisedBy: userIdStr },
        { againstUser: userIdStr },
        { deal: { $in: dealIds } }
      ]
    })
      .populate('deal')
      .populate('milestone')
      .populate('raisedBy', 'name email profileImage avatar')
      .populate('againstUser', 'name email profileImage avatar')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  return disputes.map(d => d.toJSON());
};

/**
 * Get dispute by ID
 */
export const getDisputeById = async (id, user) => {
  const dispute = await helperFindDispute(id);
  if (!dispute) {
    const error = new Error('Dispute not found');
    error.statusCode = 404;
    throw error;
  }

  const dispObj = dispute.toJSON();
  const userIdStr = (user.id || user._id).toString();

  if (user.role !== 'admin') {
    const deal = await helperFindDeal(dispObj.dealId);
    const clientIdStr = deal?.client?._id ? deal.client._id.toString() : deal?.client?.toString();
    const freelancerIdStr = deal?.freelancer?._id ? deal.freelancer._id.toString() : deal?.freelancer?.toString();

    if (dispObj.openedBy !== userIdStr && clientIdStr !== userIdStr && freelancerIdStr !== userIdStr) {
      const error = new Error('You are not authorized to view this dispute');
      error.statusCode = 403;
      throw error;
    }
  }

  return dispObj;
};

/**
 * Admin Resolves Dispute
 * Decision: 'REFUND_CLIENT' or 'RELEASE_FREELANCER'
 */
export const resolveDispute = async (id, { decision, resolutionNotes }, adminUser) => {
  if (adminUser.role !== 'admin') {
    const error = new Error('Only platform administrators can resolve disputes');
    error.statusCode = 403;
    throw error;
  }

  const dispute = await helperFindDispute(id);
  if (!dispute) {
    const error = new Error('Dispute not found');
    error.statusCode = 404;
    throw error;
  }

  if (['RESOLVED', 'CLOSED'].includes(dispute.status.toUpperCase())) {
    const error = new Error('This dispute is already resolved');
    error.statusCode = 400;
    throw error;
  }

  const validDecisions = ['REFUND_CLIENT', 'RELEASE_FREELANCER'];
  if (!validDecisions.includes(decision)) {
    const error = new Error(`Invalid admin decision. Must be one of: ${validDecisions.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const deal = await Deal.findById(dispute.deal?._id || dispute.deal);
  const milestone = dispute.milestone ? await Milestone.findById(dispute.milestone?._id || dispute.milestone) : null;
  const resolutionAmount = milestone ? milestone.amount : (deal ? deal.amount : 0);

  dispute.status = 'RESOLVED';
  dispute.adminDecision = decision;
  dispute.resolution = resolutionNotes || `Dispute resolved with decision: ${decision}`;
  dispute.resolvedBy = adminUser._id || adminUser.id;
  dispute.resolvedAt = new Date();
  await dispute.save();

  if (decision === 'REFUND_CLIENT') {
    // 1. Refund Client
    if (milestone) {
      milestone.status = 'REFUNDED';
      await milestone.save();
    }
    if (deal) {
      deal.status = 'CANCELLED';
      await deal.save();
    }

    // Ledger Transaction: Refund
    await Transaction.create({
      deal: deal?._id,
      milestone: milestone?._id,
      client: deal?.client,
      freelancer: deal?.freelancer,
      user: deal?.client,
      amount: resolutionAmount,
      currency: 'INR',
      type: 'PAYMENT_REFUNDED',
      status: 'REFUNDED',
      referenceId: `ref_dsp_${dispute._id}`,
      description: `Dispute Resolution: Refunded ₹${resolutionAmount.toLocaleString('en-IN')} to client. Reason: ${resolutionNotes || 'Admin decision'}`
    });

    // Notifications
    createNotification({
      userId: deal.client,
      type: 'dispute_resolved',
      title: 'Dispute Resolved: Refund Issued ✅',
      message: `Admin resolved dispute in your favor. ₹${resolutionAmount.toLocaleString('en-IN')} has been refunded.`,
      link: `/client/deals/${deal._id}`,
      relatedDeal: deal._id
    });

    createNotification({
      userId: deal.freelancer,
      type: 'dispute_resolved',
      title: 'Dispute Resolved',
      message: `Admin has resolved the dispute on "${deal.title}" with a refund to the client.`,
      link: `/freelancer/deals/${deal._id}`,
      relatedDeal: deal._id
    });

  } else if (decision === 'RELEASE_FREELANCER') {
    // 2. Release to Freelancer
    if (milestone) {
      milestone.status = 'RELEASED';
      milestone.releasedAt = new Date();
      await milestone.save();
    }
    if (deal) {
      deal.status = 'RELEASED';
      deal.completedAt = new Date();
      await deal.save();
    }

    const platformFeeRate = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '10') / 100;
    const feeAmount = Math.round(resolutionAmount * platformFeeRate);
    const netPayout = resolutionAmount - feeAmount;

    // Ledger: Release to freelancer
    await Transaction.create({
      deal: deal?._id,
      milestone: milestone?._id,
      client: deal?.client,
      freelancer: deal?.freelancer,
      user: deal?.freelancer,
      amount: netPayout,
      fee: feeAmount,
      currency: 'INR',
      type: 'PAYMENT_RELEASED',
      status: 'RELEASED',
      referenceId: `rel_dsp_${dispute._id}`,
      description: `Dispute Resolution: Released ₹${netPayout.toLocaleString('en-IN')} to freelancer (Fee: ₹${feeAmount})`
    });

    // Ledger: Platform Fee
    await Transaction.create({
      deal: deal?._id,
      milestone: milestone?._id,
      client: deal?.client,
      freelancer: deal?.freelancer,
      user: null,
      amount: feeAmount,
      currency: 'INR',
      type: 'PLATFORM_FEE',
      status: 'COMPLETED',
      referenceId: `fee_dsp_${dispute._id}`,
      description: `Platform fee on resolved dispute for milestone "${milestone ? milestone.title : deal?.title}"`
    });

    // Notifications
    createNotification({
      userId: deal.freelancer,
      type: 'dispute_resolved',
      title: 'Dispute Resolved: Funds Released! 🎉',
      message: `Admin resolved dispute in your favor. ₹${netPayout.toLocaleString('en-IN')} has been released to your balance.`,
      link: `/freelancer/earnings`,
      relatedDeal: deal._id
    });

    createNotification({
      userId: deal.client,
      type: 'dispute_resolved',
      title: 'Dispute Resolved',
      message: `Admin has resolved the dispute on "${deal.title}". Funds have been released to the freelancer.`,
      link: `/client/deals/${deal._id}`,
      relatedDeal: deal._id
    });
  }

  const updated = await helperFindDispute(dispute._id);
  return updated.toJSON();
};

/**
 * Legacy update dispute status helper (admin)
 */
export const updateDisputeStatus = async (id, newStatus, user, resolution = null) => {
  if (user.role !== 'admin') {
    const error = new Error('Only admins can update dispute status');
    error.statusCode = 403;
    throw error;
  }

  const dispute = await helperFindDispute(id);
  if (!dispute) {
    const error = new Error('Dispute not found');
    error.statusCode = 404;
    throw error;
  }

  dispute.status = newStatus;
  if (resolution) dispute.resolution = resolution;
  dispute.resolvedBy = user._id || user.id;
  await dispute.save();

  const updated = await helperFindDispute(dispute._id);
  return updated.toJSON();
};
