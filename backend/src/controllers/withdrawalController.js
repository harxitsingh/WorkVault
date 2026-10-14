import * as withdrawalService from '../services/withdrawalService.js';
import { sendSuccess } from '../utils/response.js';

export const getBalance = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const balance = await withdrawalService.getAvailableBalance(userId);
    return sendSuccess(res, balance);
  } catch (error) {
    next(error);
  }
};

export const requestWithdrawal = async (req, res, next) => {
  try {
    const result = await withdrawalService.requestWithdrawal(req.body, req.user);
    return sendSuccess(res, result, 'Withdrawal processed successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getWithdrawals = async (req, res, next) => {
  try {
    const result = await withdrawalService.getUserWithdrawals(req.user);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};
