import { Deal } from '../models/Deal.js';
import { Service } from '../models/Service.js';
import mongoose from 'mongoose';
import { createNotification } from '../utils/notificationHelper.js';

const helperFindDeal = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await Deal.findById(id)
      .populate('client', 'name email profileImage avatar')
      .populate('freelancer', 'name email profileImage avatar')
      .populate('service', 'title price category image');
  }
  return await Deal.findOne({ _id: id })
    .populate('client', 'name email profileImage avatar')
    .populate('freelancer', 'name email profileImage avatar')
    .populate('service', 'title price category image');
};

const VALID_TRANSITIONS = {
  CREATED:     ['FUNDED', 'CANCELLED'],
  FUNDED:      ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['SUBMITTED', 'CANCELLED', 'DISPUTED'],
  SUBMITTED:   ['APPROVED', 'DISPUTED', 'IN_PROGRESS'],
  APPROVED:    ['RELEASED'],
  RELEASED:    [],
  CANCELLED:   [],
  DISPUTED:    ['IN_PROGRESS', 'CANCELLED'],
  // Support lowercase aliases if passed
  pending:     ['active', 'cancelled', 'FUNDED', 'IN_PROGRESS'],
  active:      ['completed', 'cancelled', 'disputed', 'SUBMITTED', 'APPROVED'],
  completed:   [],
  cancelled:   [],
  disputed:    ['active', 'cancelled', 'IN_PROGRESS']
};

const isValidTransition = (currentStatus, newStatus) => {
  const allowed = VALID_TRANSITIONS[currentStatus];
  return allowed && allowed.includes(newStatus);
};

export const createDeal = async (data, clientUser) => {
  let service;
  if (mongoose.Types.ObjectId.isValid(data.serviceId)) {
    service = await Service.findById(data.serviceId).populate('freelancer');
  } else {
    service = await Service.findOne({ _id: data.serviceId }).populate('freelancer');
  }

  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  const freelancerIdStr = service.freelancer?._id ? service.freelancer._id.toString() : service.freelancer?.toString();
  const clientIdStr = clientUser.id || clientUser._id.toString();

  if (freelancerIdStr === clientIdStr) {
    const error = new Error('You cannot create a deal for your own service');
    error.statusCode = 400;
    throw error;
  }

  const deal = await Deal.create({
    title: data.title || service.title,
    description: data.description || service.description || '',
    service: service._id,
    client: clientUser._id || clientUser.id,
    freelancer: service.freelancer._id || service.freelancer,
    amount: data.amount ? parseFloat(data.amount) : service.price,
    requirements: data.requirements || '',
    status: 'CREATED',
    deadline: data.deadline || null
  });

  const populated = await helperFindDeal(deal._id);

  // Notify freelancer about new deal
  const freelancerId = service.freelancer._id || service.freelancer;
  createNotification({
    userId: freelancerId,
    type: 'deal_created',
    title: 'New Deal Offer',
    message: `You received a new deal for "${deal.title}"`,
    link: `/freelancer/deals/${deal._id}`,
    relatedDeal: deal._id
  });

  return populated.toJSON();
};

export const getDeals = async (user, query = {}) => {
  const filter = {};
  const userIdStr = (user.id || user._id).toString();

  if (user.role === 'client') {
    filter.client = userIdStr;
  } else if (user.role === 'freelancer') {
    filter.freelancer = userIdStr;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const deals = await Deal.find(filter)
    .populate('client', 'name email profileImage avatar')
    .populate('freelancer', 'name email profileImage avatar')
    .populate('service', 'title price category image')
    .sort({ createdAt: -1 });

  return deals.map(d => d.toJSON());
};

export const getDealById = async (id, user) => {
  const deal = await helperFindDeal(id);
  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  const dealObj = deal.toJSON();
  const userIdStr = (user.id || user._id).toString();

  if (user.role !== 'admin' && dealObj.clientId !== userIdStr && dealObj.freelancerId !== userIdStr) {
    const error = new Error('You are not authorized to view this deal');
    error.statusCode = 403;
    throw error;
  }

  return dealObj;
};

export const updateDealStatus = async (id, newStatus, user) => {
  const deal = await helperFindDeal(id);
  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  const dealObj = deal.toJSON();
  const userIdStr = (user.id || user._id).toString();

  if (user.role !== 'admin' && dealObj.clientId !== userIdStr && dealObj.freelancerId !== userIdStr) {
    const error = new Error('You are not authorized to update this deal');
    error.statusCode = 403;
    throw error;
  }

  if (!isValidTransition(deal.status, newStatus)) {
    const error = new Error(
      `Invalid status transition: ${deal.status} → ${newStatus}. Allowed: ${VALID_TRANSITIONS[deal.status]?.join(', ') || 'none (terminal state)'}`
    );
    error.statusCode = 400;
    throw error;
  }

  deal.status = newStatus;
  await deal.save();

  const updated = await helperFindDeal(deal._id);
  return updated.toJSON();
};

export const submitDeal = async (id, submissionData, user) => {
  const deal = await helperFindDeal(id);
  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  const dealObj = deal.toJSON();
  const userIdStr = (user.id || user._id).toString();

  if (dealObj.freelancerId !== userIdStr) {
    const error = new Error('Only the assigned freelancer can submit work');
    error.statusCode = 403;
    throw error;
  }

  if (!isValidTransition(deal.status, 'SUBMITTED')) {
    const error = new Error(`Cannot submit work when deal is in ${deal.status} status`);
    error.statusCode = 400;
    throw error;
  }

  deal.status = 'SUBMITTED';
  deal.submission = {
    message: submissionData.message || '',
    files: submissionData.files || [],
    submittedAt: new Date().toISOString()
  };

  await deal.save();

  // Notify client that work was submitted
  createNotification({
    userId: dealObj.clientId,
    type: 'delivery_submitted',
    title: 'Work Delivered',
    message: `Freelancer submitted work for "${deal.title}"`,
    link: `/client/deals/${deal._id}`,
    relatedDeal: deal._id
  });

  const updated = await helperFindDeal(deal._id);
  return updated.toJSON();
};

export const approveDeal = async (id, user) => {
  const deal = await helperFindDeal(id);
  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  const dealObj = deal.toJSON();
  const userIdStr = (user.id || user._id).toString();

  if (dealObj.clientId !== userIdStr && user.role !== 'admin') {
    const error = new Error('Only the client can approve work');
    error.statusCode = 403;
    throw error;
  }

  if (!isValidTransition(deal.status, 'APPROVED')) {
    const error = new Error(`Cannot approve when deal is in ${deal.status} status`);
    error.statusCode = 400;
    throw error;
  }

  deal.status = 'APPROVED';
  await deal.save();

  // Notify freelancer that work was approved
  createNotification({
    userId: dealObj.freelancerId,
    type: 'deal_completed',
    title: 'Work Approved',
    message: `Your work on "${deal.title}" was approved!`,
    link: `/freelancer/deals/${deal._id}`,
    relatedDeal: deal._id
  });

  const updated = await helperFindDeal(deal._id);
  return updated.toJSON();
};

export const cancelDeal = async (id, user) => {
  const deal = await helperFindDeal(id);
  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  const dealObj = deal.toJSON();
  const userIdStr = (user.id || user._id).toString();

  if (user.role !== 'admin' && dealObj.clientId !== userIdStr && dealObj.freelancerId !== userIdStr) {
    const error = new Error('You are not authorized to cancel this deal');
    error.statusCode = 403;
    throw error;
  }

  if (!isValidTransition(deal.status, 'CANCELLED')) {
    const error = new Error(`Cannot cancel deal in ${deal.status} status`);
    error.statusCode = 400;
    throw error;
  }

  deal.status = 'CANCELLED';
  await deal.save();

  const updated = await helperFindDeal(deal._id);
  return updated.toJSON();
};
