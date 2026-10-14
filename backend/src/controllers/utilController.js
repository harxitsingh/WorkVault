import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Deal } from '../models/Deal.js';
import { Transaction } from '../models/Transaction.js';
import { FileAttachment } from '../models/FileAttachment.js';
import { Dispute } from '../models/Dispute.js';
import { sendSuccess } from '../utils/response.js';
import { calculateFreelancerTrustMetrics, calculateClientTrustMetrics } from '../services/trustMetricService.js';
import * as withdrawalService from '../services/withdrawalService.js';
import * as transactionService from '../services/transactionService.js';
import { uploadFileToStorage, getStorageConfig } from '../services/storageService.js';

/**
 * Global search across users, services, and deals
 * GET /api/search?q=query
 */
export const search = async (req, res, next) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query || query.length < 2) {
      return sendSuccess(res, { users: [], services: [], deals: [] });
    }

    const regex = new RegExp(query, 'i');

    const [users, services, deals] = await Promise.all([
      User.find({
        $or: [
          { name: regex },
          { email: regex },
          { title: regex }
        ]
      }).select('name email role profileImage avatar title rating').limit(10),

      Service.find({
        $or: [
          { title: regex },
          { description: regex },
          { category: regex },
          { tags: regex }
        ],
        isActive: true
      }).populate('freelancer', 'name profileImage avatar rating').limit(10),

      req.user ? Deal.find({
        $and: [
          {
            $or: [
              { title: regex },
              { description: regex }
            ]
          },
          req.user.role === 'admin' ? {} : {
            $or: [
              { client: req.user.id || req.user._id },
              { freelancer: req.user.id || req.user._id }
            ]
          }
        ]
      }).populate('client', 'name').populate('freelancer', 'name').populate('service', 'title').limit(10) : Promise.resolve([])
    ]);

    sendSuccess(res, {
      users: users.map(u => u.toJSON()),
      services: services.map(s => s.toJSON()),
      deals: deals.map(d => d.toJSON())
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload file endpoint with metadata persistence in FileAttachment
 * POST /api/upload
 */
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file && req.files && req.files.length > 0) {
      req.file = req.files.find(f => ['service_images', 'image', 'file', 'avatar', 'deliverable'].includes(f.fieldname)) || req.files[0];
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Determine category: if category is 'service_images' or an image field name, map to 'service'
    let category = req.body.category || 'general';
    if (category === 'service_images') {
      category = 'service';
    }
    const validCategories = ['service', 'avatar', 'deliverable', 'dispute_evidence', 'general'];
    if (!validCategories.includes(category)) {
      category = 'general';
    }

    const storageResult = await uploadFileToStorage(req.file, category);
    const userId = req.user?._id || req.user?.id;

    // Save metadata in MongoDB FileAttachment
    let attachment = null;
    if (userId) {
      attachment = await FileAttachment.create({
        fileName: storageResult.originalName,
        fileUrl: storageResult.fileUrl,
        publicId: storageResult.publicId || storageResult.filename,
        mimeType: storageResult.mimetype,
        size: storageResult.size,
        category: category,
        uploadedBy: userId,
        uploadedAt: new Date()
      });
    }

    sendSuccess(res, {
      url: storageResult.url,
      fileUrl: storageResult.fileUrl,
      fullUrl: storageResult.fullUrl || storageResult.url,
      filename: storageResult.filename,
      originalName: storageResult.originalName,
      size: storageResult.size,
      mimetype: storageResult.mimetype,
      provider: storageResult.provider,
      attachmentId: attachment ? attachment._id : null
    }, 'File uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Trust metrics endpoint
 * GET /api/users/:id/trust-metrics or GET /api/stats/trust
 */
export const getTrustMetrics = async (req, res, next) => {
  try {
    const targetUserId = req.params.id || req.user.id || req.user._id;
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let metrics;
    if (targetUser.role === 'freelancer') {
      metrics = await calculateFreelancerTrustMetrics(targetUser._id);
    } else {
      metrics = await calculateClientTrustMetrics(targetUser._id);
    }

    sendSuccess(res, { user: targetUser.toJSON(), metrics });
  } catch (error) {
    next(error);
  }
};

/**
 * Dashboard stats for freelancer
 * GET /api/stats/freelancer
 */
export const getFreelancerStats = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const deals = await Deal.find({ freelancer: userId });
    const transactions = await Transaction.find({ freelancer: userId });
    const balanceInfo = await withdrawalService.getAvailableBalance(userId);
    const trustMetrics = await calculateFreelancerTrustMetrics(userId);

    const activeStatuses = ['CREATED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'active', 'pending'];
    const completedStatuses = ['RELEASED', 'completed'];

    const activeOrders = deals.filter(d => activeStatuses.includes(d.status)).length;
    const completedOrders = deals.filter(d => completedStatuses.includes(d.status)).length;
    const amountHeld = transactions
      .filter(t => ['HELD', 'held'].includes(t.status))
      .reduce((sum, t) => sum + t.amount, 0);
    const releasedEarnings = balanceInfo.totalEarnings;
    const availableForWithdrawal = balanceInfo.availableBalance;

    sendSuccess(res, {
      activeOrders,
      completedOrders,
      amountHeld,
      releasedEarnings,
      netEarnings: releasedEarnings,
      availableForWithdrawal,
      pendingAmount: transactions.filter(t => ['PENDING', 'pending'].includes(t.status)).reduce((s, t) => s + t.amount, 0),
      totalDeals: deals.length,
      averageRating: trustMetrics.averageRating,
      trustScore: trustMetrics.trustScore,
      trustMetrics,
      transactions: transactions.slice(0, 10).map(t => t.toJSON())
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dashboard stats for client
 * GET /api/stats/client
 */
export const getClientStats = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const deals = await Deal.find({ client: userId });
    const transactions = await Transaction.find({ client: userId });
    const trustMetrics = await calculateClientTrustMetrics(userId);

    const activeStatuses = ['CREATED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'active', 'pending'];
    const completedStatuses = ['RELEASED', 'completed'];

    sendSuccess(res, {
      activeDeals: deals.filter(d => activeStatuses.includes(d.status)).length,
      completedDeals: deals.filter(d => completedStatuses.includes(d.status)).length,
      amountHeld: transactions.filter(t => ['HELD', 'held'].includes(t.status)).reduce((s, t) => s + t.amount, 0),
      amountReleased: transactions.filter(t => ['RELEASED', 'released'].includes(t.status)).reduce((s, t) => s + t.amount, 0),
      totalDeals: deals.length,
      trustScore: trustMetrics.trustScore,
      trustMetrics,
      transactions: transactions.slice(0, 10).map(t => t.toJSON())
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dashboard stats for admin
 * GET /api/stats/admin
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalClients, totalFreelancers, totalDeals, allTransactions, activeDeals, openDisputes] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'freelancer' }),
      Deal.countDocuments(),
      Transaction.find(),
      Deal.countDocuments({ status: { $in: ['CREATED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'active', 'pending'] } }),
      Dispute.countDocuments({ status: { $in: ['open', 'OPEN', 'in_review', 'UNDER_REVIEW', 'pending'] } })
    ]);

    const totalTransactionValue = allTransactions
      .filter(t => ['PAYMENT_FUNDED', 'payment', 'escrow'].includes(t.type))
      .reduce((s, t) => s + (t.amount || 0), 0);
    const heldAmount = allTransactions
      .filter(t => ['HELD', 'held'].includes(t.status))
      .reduce((s, t) => s + (t.amount || 0), 0);
    const releasedAmount = allTransactions
      .filter(t => ['RELEASED', 'released'].includes(t.status))
      .reduce((s, t) => s + (t.amount || 0), 0);
    const platformFees = allTransactions
      .filter(t => t.type === 'PLATFORM_FEE')
      .reduce((s, t) => s + (t.amount || 0), 0);

    sendSuccess(res, {
      totalUsers,
      clients: totalClients,
      freelancers: totalFreelancers,
      totalDeals,
      activeDeals,
      totalTransactionValue,
      heldAmount,
      releasedAmount,
      platformFees,
      openDisputes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download earnings statement as real CSV
 * GET /api/transactions/statement
 */
export const downloadStatement = async (req, res, next) => {
  try {
    const csvData = await transactionService.generateStatementCsv(req.user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=workvault-statement-${Date.now()}.csv`);
    return res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

/**
 * Payout withdrawal
 * POST /api/transactions/withdraw
 */
export const withdrawFunds = async (req, res, next) => {
  try {
    const result = await withdrawalService.requestWithdrawal(req.body, req.user);
    sendSuccess(res, result, 'Withdrawal processed successfully', 201);
  } catch (error) {
    next(error);
  }
};
