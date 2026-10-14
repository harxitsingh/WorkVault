import * as txService from '../services/transactionService.js';
import { sendSuccess } from '../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const tx = await txService.createTransaction(req.body, req.user);
    sendSuccess(res, tx, 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const txs = await txService.getTransactions(req.user);
    sendSuccess(res, txs);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const tx = await txService.getTransactionById(req.params.id, req.user);
    sendSuccess(res, tx);
  } catch (error) {
    next(error);
  }
};

export const fund = async (req, res, next) => {
  try {
    const tx = await txService.fundTransaction(req.params.id, req.user);
    sendSuccess(res, tx);
  } catch (error) {
    next(error);
  }
};

export const release = async (req, res, next) => {
  try {
    const tx = await txService.releaseTransaction(req.params.id, req.user);
    sendSuccess(res, tx);
  } catch (error) {
    next(error);
  }
};

export const refund = async (req, res, next) => {
  try {
    const tx = await txService.refundTransaction(req.params.id, req.user);
    sendSuccess(res, tx);
  } catch (error) {
    next(error);
  }
};
