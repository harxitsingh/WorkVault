import * as milestoneService from '../services/milestoneService.js';
import { sendSuccess } from '../utils/response.js';

export const createMilestone = async (req, res, next) => {
  try {
    const dealId = req.params.dealId || req.body.dealId;
    const result = await milestoneService.createMilestone(dealId, req.body, req.user);
    return sendSuccess(res, result, 'Milestone created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getMilestonesByDeal = async (req, res, next) => {
  try {
    const dealId = req.params.dealId;
    const result = await milestoneService.getMilestonesByDeal(dealId, req.user);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getMilestoneById = async (req, res, next) => {
  try {
    const result = await milestoneService.getMilestoneById(req.params.id, req.user);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const fundMilestone = async (req, res, next) => {
  try {
    const paymentReference = req.body.paymentReference || req.body.referenceId || '';
    const result = await milestoneService.fundMilestone(req.params.id, req.user, paymentReference);
    return sendSuccess(res, result, 'Milestone funded into escrow successfully');
  } catch (error) {
    next(error);
  }
};

export const startMilestoneWork = async (req, res, next) => {
  try {
    const result = await milestoneService.startMilestoneWork(req.params.id, req.user);
    return sendSuccess(res, result, 'Milestone work started');
  } catch (error) {
    next(error);
  }
};

export const submitMilestoneWork = async (req, res, next) => {
  try {
    const result = await milestoneService.submitMilestoneWork(req.params.id, req.body, req.user);
    return sendSuccess(res, result, 'Work submitted for milestone');
  } catch (error) {
    next(error);
  }
};

export const requestMilestoneRevision = async (req, res, next) => {
  try {
    const result = await milestoneService.requestMilestoneRevision(req.params.id, req.body, req.user);
    return sendSuccess(res, result, 'Revision requested for milestone');
  } catch (error) {
    next(error);
  }
};

export const approveAndReleaseMilestone = async (req, res, next) => {
  try {
    const result = await milestoneService.approveAndReleaseMilestone(req.params.id, req.user);
    return sendSuccess(res, result, 'Milestone approved and payment released to freelancer');
  } catch (error) {
    next(error);
  }
};
