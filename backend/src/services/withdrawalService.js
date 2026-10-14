import { Withdrawal } from '../models/Withdrawal.js';
import { Transaction } from '../models/Transaction.js';
import { createNotification } from '../utils/notificationHelper.js';
import mongoose from 'mongoose';

/**
 * Calculate accurate real-time available balance for a freelancer directly from ledger
 */
export const getAvailableBalance = async (userId) => {
  const uId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  // 1. Total earnings released to this freelancer
  const releasedTxs = await Transaction.find({
    freelancer: uId,
    type: 'PAYMENT_RELEASED',
    status: 'RELEASED'
  });
  const totalEarnings = releasedTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  // 2. Total withdrawals requested or completed
  const withdrawals = await Withdrawal.find({
    user: uId,
    status: { $in: ['REQUESTED', 'PROCESSING', 'COMPLETED'] }
  });
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

  const availableBalance = Math.max(0, totalEarnings - totalWithdrawn);
  return { totalEarnings, totalWithdrawn, availableBalance };
};

/**
 * Request a withdrawal (simulated or configured payout)
 */
export const requestWithdrawal = async (data, user) => {
  const userId = user._id || user.id;
  const amount = parseFloat(data.amount);

  if (!amount || amount <= 0) {
    const error = new Error('Withdrawal amount must be greater than zero');
    error.statusCode = 400;
    throw error;
  }

  // Prevent multiple active pending withdrawals
  const pendingWithdrawal = await Withdrawal.findOne({
    user: userId,
    status: { $in: ['REQUESTED', 'PROCESSING'] }
  });
  if (pendingWithdrawal) {
    const error = new Error('You already have a withdrawal in processing. Please wait for it to complete.');
    error.statusCode = 409;
    throw error;
  }

  // Check balance
  const { availableBalance } = await getAvailableBalance(userId);
  if (amount > availableBalance) {
    const error = new Error(`Insufficient funds. Your available balance is ₹${availableBalance.toLocaleString('en-IN')}`);
    error.statusCode = 400;
    throw error;
  }

  // Create Withdrawal record
  const withdrawal = await Withdrawal.create({
    user: userId,
    amount,
    currency: 'INR',
    status: 'COMPLETED', // In simulated environment, completes immediately
    payoutMethod: data.payoutMethod || 'bank_transfer',
    accountDetails: data.accountDetails || {},
    notes: data.notes || 'Simulated fast payout transfer',
    processedAt: new Date()
  });

  // Create immutable Ledger Entry
  const transaction = await Transaction.create({
    user: userId,
    freelancer: userId,
    amount,
    currency: 'INR',
    type: 'WITHDRAWAL',
    status: 'COMPLETED',
    referenceId: `wth_${withdrawal._id}`,
    description: `Withdrawal payout to bank account (Ref: ${withdrawal._id})`
  });

  withdrawal.transaction = transaction._id;
  await withdrawal.save();

  // Send notification
  createNotification({
    userId,
    type: 'payment_released',
    title: 'Payout Processed Successfully 🏦',
    message: `₹${amount.toLocaleString('en-IN')} has been withdrawn to your account (Ref: ${withdrawal._id})`,
    link: `/freelancer/earnings`
  });

  const updatedBalance = await getAvailableBalance(userId);

  return {
    withdrawal: withdrawal.toJSON(),
    transaction: transaction.toJSON(),
    newBalance: updatedBalance.availableBalance
  };
};

/**
 * Get user withdrawals
 */
export const getUserWithdrawals = async (user) => {
  const userId = user._id || user.id;
  const filter = user.role === 'admin' ? {} : { user: userId };
  const withdrawals = await Withdrawal.find(filter)
    .populate('user', 'name email profileImage avatar')
    .sort({ createdAt: -1 });
  return withdrawals.map(w => w.toJSON());
};
