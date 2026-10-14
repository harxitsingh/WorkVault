import * as dealService from '../services/dealService.js';
import { sendSuccess } from '../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const deal = await dealService.createDeal(req.body, req.user);
    sendSuccess(res, deal, 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const deals = await dealService.getDeals(req.user, req.query);
    sendSuccess(res, deals);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const deal = await dealService.getDealById(req.params.id, req.user);
    sendSuccess(res, deal);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const deal = await dealService.updateDealStatus(req.params.id, req.body.status, req.user);
    sendSuccess(res, deal);
  } catch (error) {
    next(error);
  }
};

export const submit = async (req, res, next) => {
  try {
    const deal = await dealService.submitDeal(req.params.id, req.body, req.user);
    sendSuccess(res, deal);
  } catch (error) {
    next(error);
  }
};

export const approve = async (req, res, next) => {
  try {
    const deal = await dealService.approveDeal(req.params.id, req.user);
    sendSuccess(res, deal);
  } catch (error) {
    next(error);
  }
};

export const cancel = async (req, res, next) => {
  try {
    const deal = await dealService.cancelDeal(req.params.id, req.user);
    sendSuccess(res, deal);
  } catch (error) {
    next(error);
  }
};
