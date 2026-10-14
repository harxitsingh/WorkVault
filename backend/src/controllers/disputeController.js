import * as disputeService from '../services/disputeService.js';
import { sendSuccess } from '../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const dispute = await disputeService.createDispute(req.body, req.user);
    sendSuccess(res, dispute, 'Dispute opened successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const disputes = await disputeService.getDisputes(req.user);
    sendSuccess(res, disputes);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const dispute = await disputeService.getDisputeById(req.params.id, req.user);
    sendSuccess(res, dispute);
  } catch (error) {
    next(error);
  }
};

export const addEvidence = async (req, res, next) => {
  try {
    const dispute = await disputeService.addDisputeEvidence(req.params.id, req.body, req.user);
    sendSuccess(res, dispute, 'Evidence added successfully');
  } catch (error) {
    next(error);
  }
};

export const resolve = async (req, res, next) => {
  try {
    const dispute = await disputeService.resolveDispute(req.params.id, req.body, req.user);
    sendSuccess(res, dispute, 'Dispute resolved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const status = req.body.status || req.body;
    const resolution = req.body.resolution;
    const dispute = await disputeService.updateDisputeStatus(req.params.id, status, req.user, resolution);
    sendSuccess(res, dispute);
  } catch (error) {
    next(error);
  }
};
