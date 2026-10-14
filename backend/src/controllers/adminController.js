import * as adminService from '../services/adminService.js';
import { sendSuccess } from '../utils/response.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};

export const getServices = async (req, res, next) => {
  try {
    const services = await adminService.getAllServices();
    sendSuccess(res, services);
  } catch (error) {
    next(error);
  }
};

export const getDeals = async (req, res, next) => {
  try {
    const deals = await adminService.getAllDeals();
    sendSuccess(res, deals);
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await adminService.getAllTransactions();
    sendSuccess(res, transactions);
  } catch (error) {
    next(error);
  }
};

export const getDisputes = async (req, res, next) => {
  try {
    const disputes = await adminService.getAllDisputes();
    sendSuccess(res, disputes);
  } catch (error) {
    next(error);
  }
};

export const resolveDispute = async (req, res, next) => {
  try {
    const dispute = await adminService.resolveDispute(req.params.id, req.body, req.user);
    sendSuccess(res, dispute);
  } catch (error) {
    next(error);
  }
};
