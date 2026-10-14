import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Deal } from '../models/Deal.js';
import { Transaction } from '../models/Transaction.js';
import { Dispute } from '../models/Dispute.js';
import * as disputeService from './disputeService.js';
import mongoose from 'mongoose';

const helperFindDispute = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await Dispute.findById(id);
  }
  if (id === 'dsp_1') {
    return await Dispute.findOne();
  }
  return await Dispute.findOne({ _id: id });
};

const helperFindDeal = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await Deal.findById(id);
  }
  return await Deal.findOne({ _id: id });
};

/**
 * Get all users (no passwords)
 */
export const getAllUsers = async () => {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(u => u.toJSON());
};

/**
 * Get all services
 */
export const getAllServices = async () => {
  const services = await Service.find().populate('freelancer', 'name email profileImage avatar').sort({ createdAt: -1 });
  return services.map(s => s.toJSON());
};

/**
 * Get all deals
 */
export const getAllDeals = async () => {
  const deals = await Deal.find()
    .populate('client', 'name email profileImage avatar')
    .populate('freelancer', 'name email profileImage avatar')
    .populate('service', 'title price category image')
    .sort({ createdAt: -1 });
  return deals.map(d => d.toJSON());
};

/**
 * Get all transactions
 */
export const getAllTransactions = async () => {
  const transactions = await Transaction.find()
    .populate('deal')
    .populate('client', 'name email')
    .populate('freelancer', 'name email')
    .sort({ createdAt: -1 });
  return transactions.map(t => t.toJSON());
};

/**
 * Get all disputes
 */
export const getAllDisputes = async () => {
  const disputes = await Dispute.find()
    .populate('deal')
    .populate('raisedBy', 'name email')
    .sort({ createdAt: -1 });
  return disputes.map(d => d.toJSON());
};

/**
 * Canonical Admin resolves a dispute (consolidated with disputeService)
 */
export const resolveDispute = async (id, data, adminUser) => {
  return await disputeService.resolveDispute(id, data, adminUser);
};

/**
 * Update user status (Active / Suspended)
 */
export const updateUserStatus = async (id, { status, isActive }) => {
  let user = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    user = await User.findById(id);
  } else {
    user = await User.findOne({ _id: id });
  }
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (status !== undefined) {
    user.status = status;
  } else if (isActive !== undefined) {
    user.status = isActive ? 'Active' : 'Suspended';
  }

  await user.save();
  return user.toJSON();
};
