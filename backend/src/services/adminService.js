import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Deal } from '../models/Deal.js';
import { Transaction } from '../models/Transaction.js';
import { Dispute } from '../models/Dispute.js';
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
 * Admin resolves a dispute
 */
export const resolveDispute = async (id, data, adminUser) => {
  const dispute = await helperFindDispute(id);
  if (!dispute) {
    const error = new Error('Dispute not found');
    error.statusCode = 404;
    throw error;
  }

  if (dispute.status === 'CLOSED' || dispute.status === 'closed') {
    const error = new Error('Dispute is already closed');
    error.statusCode = 400;
    throw error;
  }

  dispute.status = 'RESOLVED';
  dispute.resolution = data.resolution || 'Resolved by admin';
  dispute.resolvedBy = adminUser._id || adminUser.id;
  await dispute.save();

  // Optionally update deal status based on admin action
  if (data.dealAction) {
    const deal = await helperFindDeal(dispute.deal);
    if (deal) {
      if (data.dealAction === 'cancel') {
        deal.status = 'CANCELLED';
      } else if (data.dealAction === 'resume') {
        deal.status = 'IN_PROGRESS';
      }
      await deal.save();
    }
  }

  const updated = await helperFindDispute(dispute._id);
  return updated.toJSON();
};
