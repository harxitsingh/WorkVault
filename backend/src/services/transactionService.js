import { Transaction } from '../models/Transaction.js';
import { Deal } from '../models/Deal.js';
import { Milestone } from '../models/Milestone.js';
import { Withdrawal } from '../models/Withdrawal.js';
import mongoose from 'mongoose';
import { createNotification } from '../utils/notificationHelper.js';

const helperFindDeal = async (dealId) => {
  if (mongoose.Types.ObjectId.isValid(dealId)) {
    return await Deal.findById(dealId);
  }
  return await Deal.findOne({ _id: dealId });
};

const helperFindTx = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await Transaction.findById(id)
      .populate('deal')
      .populate('milestone')
      .populate('client', 'name email profileImage avatar')
      .populate('freelancer', 'name email profileImage avatar')
      .populate('user', 'name email');
  }
  return await Transaction.findOne({ _id: id })
    .populate('deal')
    .populate('milestone')
    .populate('client', 'name email profileImage avatar')
    .populate('freelancer', 'name email profileImage avatar')
    .populate('user', 'name email');
};

/**
 * Create a transaction for a deal or milestone
 */
export const createTransaction = async (data, user) => {
  const deal = await helperFindDeal(data.dealId);
  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  const clientIdStr = deal.client?._id ? deal.client._id.toString() : deal.client?.toString();
  const userIdStr = (user.id || user._id).toString();

  if (clientIdStr !== userIdStr && user.role !== 'admin') {
    const error = new Error('Only the deal client can create a transaction');
    error.statusCode = 403;
    throw error;
  }

  const existingActive = await Transaction.findOne({
    deal: deal._id,
    status: { $in: ['PENDING', 'pending', 'HELD', 'held'] }
  });
  if (existingActive) {
    const error = new Error('An active transaction already exists for this deal');
    error.statusCode = 409;
    throw error;
  }

  const transaction = await Transaction.create({
    deal: deal._id,
    milestone: data.milestoneId || null,
    client: deal.client,
    freelancer: deal.freelancer,
    user: user._id || user.id,
    amount: data.amount || deal.amount,
    type: data.type || 'PAYMENT_FUNDED',
    status: data.status || 'PENDING',
    referenceId: data.referenceId || `ref_${Date.now()}`,
    description: data.description || `Transaction for deal ${deal.title}`
  });

  const populated = await helperFindTx(transaction._id);
  return populated.toJSON();
};

/**
 * Get transactions for a user with optional filtering
 */
export const getTransactions = async (user, query = {}) => {
  const userIdStr = (user.id || user._id).toString();
  const filter = {};

  if (user.role !== 'admin') {
    filter.$or = [
      { client: userIdStr },
      { freelancer: userIdStr },
      { user: userIdStr }
    ];
  }

  if (query.type) {
    filter.type = query.type;
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.dealId) {
    filter.deal = query.dealId;
  }

  const transactions = await Transaction.find(filter)
    .populate('deal')
    .populate('milestone')
    .populate('client', 'name email profileImage avatar')
    .populate('freelancer', 'name email profileImage avatar')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  return transactions.map(t => t.toJSON());
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (id, user) => {
  const transaction = await helperFindTx(id);
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  const txObj = transaction.toJSON();
  const userIdStr = (user.id || user._id).toString();

  if (
    user.role !== 'admin' &&
    txObj.clientId !== userIdStr &&
    txObj.freelancerId !== userIdStr &&
    txObj.userId !== userIdStr
  ) {
    const error = new Error('You are not authorized to view this transaction');
    error.statusCode = 403;
    throw error;
  }

  return txObj;
};

/**
 * Get complete Ledger Summary and metrics
 */
export const getLedgerSummary = async (user) => {
  const userId = user._id || user.id;
  const userIdStr = userId.toString();

  if (user.role === 'admin') {
    const allTxs = await Transaction.find();
    const totalVolume = allTxs
      .filter(t => ['PAYMENT_FUNDED', 'payment', 'escrow'].includes(t.type))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalHeld = allTxs
      .filter(t => ['HELD', 'held'].includes(t.status))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalReleased = allTxs
      .filter(t => ['RELEASED', 'released'].includes(t.status))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalRefunded = allTxs
      .filter(t => ['REFUNDED', 'refunded'].includes(t.status))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const platformFees = allTxs
      .filter(t => t.type === 'PLATFORM_FEE')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      totalVolume,
      totalHeld,
      totalReleased,
      totalRefunded,
      platformFees,
      totalTransactions: allTxs.length
    };
  }

  if (user.role === 'freelancer') {
    const txs = await Transaction.find({ freelancer: userId });
    const totalEarnings = txs
      .filter(t => ['PAYMENT_RELEASED', 'release'].includes(t.type) && ['RELEASED', 'released'].includes(t.status))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const heldInEscrow = txs
      .filter(t => ['PAYMENT_FUNDED', 'payment', 'escrow'].includes(t.type) && ['HELD', 'held'].includes(t.status))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const withdrawals = await Withdrawal.find({
      user: userId,
      status: { $in: ['REQUESTED', 'PROCESSING', 'COMPLETED'] }
    });
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    const availableBalance = Math.max(0, totalEarnings - totalWithdrawn);

    return {
      totalEarnings,
      heldInEscrow,
      totalWithdrawn,
      availableBalance
    };
  }

  // Client
  const clientTxs = await Transaction.find({ client: userId });
  const totalFunded = clientTxs
    .filter(t => ['PAYMENT_FUNDED', 'payment', 'escrow'].includes(t.type))
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalHeld = clientTxs
    .filter(t => ['HELD', 'held'].includes(t.status))
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalReleased = clientTxs
    .filter(t => ['RELEASED', 'released'].includes(t.status))
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalRefunded = clientTxs
    .filter(t => ['REFUNDED', 'refunded'].includes(t.status))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return {
    totalFunded,
    totalHeld,
    totalReleased,
    totalRefunded
  };
};

/**
 * Generate CSV Statement
 */
export const generateStatementCsv = async (user) => {
  const transactions = await getTransactions(user);

  const headers = ['Date', 'Transaction ID', 'Deal / Milestone', 'Type', 'Amount (INR)', 'Status', 'Reference ID', 'Description'];
  const rows = transactions.map(t => [
    new Date(t.createdAt).toISOString().split('T')[0],
    t.id || t._id,
    `"${(t.deal?.title || t.milestone?.title || 'General').replace(/"/g, '""')}"`,
    t.type,
    t.amount,
    t.status,
    t.referenceId || t.paymentReference || '',
    `"${(t.description || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return csvContent;
};

/**
 * Fund a transaction (legacy helper compatibility)
 */
export const fundTransaction = async (id, user) => {
  const transaction = await helperFindTx(id);
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  if (['HELD', 'held', 'RELEASED', 'released', 'REFUNDED', 'refunded'].includes(transaction.status)) {
    const error = new Error(`Transaction is already ${transaction.status}`);
    error.statusCode = 400;
    throw error;
  }

  transaction.status = 'HELD';
  await transaction.save();

  const deal = await helperFindDeal(transaction.deal?._id || transaction.deal);
  if (deal && (deal.status === 'CREATED' || deal.status === 'pending')) {
    deal.status = 'FUNDED';
    await deal.save();
  }

  const updated = await helperFindTx(transaction._id);
  return updated.toJSON();
};

/**
 * Release funds to freelancer (legacy helper compatibility)
 */
export const releaseTransaction = async (id, user) => {
  const transaction = await helperFindTx(id);
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  if (['RELEASED', 'released'].includes(transaction.status)) {
    const error = new Error('Transaction has already been released');
    error.statusCode = 400;
    throw error;
  }

  transaction.status = 'RELEASED';
  await transaction.save();

  const deal = await helperFindDeal(transaction.deal?._id || transaction.deal);
  if (deal) {
    deal.status = 'RELEASED';
    await deal.save();
  }

  const updated = await helperFindTx(transaction._id);
  return updated.toJSON();
};

/**
 * Refund transaction (admin only)
 */
export const refundTransaction = async (id, user) => {
  const transaction = await helperFindTx(id);
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'admin') {
    const error = new Error('Only admin can refund transactions');
    error.statusCode = 403;
    throw error;
  }

  transaction.status = 'REFUNDED';
  await transaction.save();

  const deal = await helperFindDeal(transaction.deal?._id || transaction.deal);
  if (deal) {
    deal.status = 'CANCELLED';
    await deal.save();
  }

  const updated = await helperFindTx(transaction._id);
  return updated.toJSON();
};
