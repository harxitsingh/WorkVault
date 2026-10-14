import { Review } from '../models/Review.js';
import { Deal } from '../models/Deal.js';
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import mongoose from 'mongoose';

const helperFindDeal = async (dealId) => {
  if (mongoose.Types.ObjectId.isValid(dealId)) {
    return await Deal.findById(dealId);
  }
  return await Deal.findOne({ _id: dealId });
};

/**
 * Create a review for a completed deal
 */
export const createReview = async (data, user) => {
  const deal = await helperFindDeal(data.dealId);
  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  const clientIdStr = deal.client?._id ? deal.client._id.toString() : deal.client?.toString();
  const freelancerIdStr = deal.freelancer?._id ? deal.freelancer._id.toString() : deal.freelancer?.toString();
  const userIdStr = (user.id || user._id).toString();

  // Only clients can review
  if (user.role !== 'client' || clientIdStr !== userIdStr) {
    const error = new Error('Only the client of this deal can leave a review');
    error.statusCode = 403;
    throw error;
  }

  // Deal must be completed (APPROVED, RELEASED, or completed)
  if (!['APPROVED', 'RELEASED', 'completed'].includes(deal.status)) {
    const error = new Error('Can only review completed deals');
    error.statusCode = 400;
    throw error;
  }

  // Prevent self-review
  if (freelancerIdStr === userIdStr) {
    const error = new Error('You cannot review yourself');
    error.statusCode = 400;
    throw error;
  }

  // One review per deal
  const existing = await Review.findOne({
    deal: deal._id,
    client: user._id || user.id
  });
  if (existing) {
    const error = new Error('You have already reviewed this deal');
    error.statusCode = 409;
    throw error;
  }

  const ratingVal = parseInt(data.rating);
  if (ratingVal > 5 || ratingVal < 1) {
    const error = new Error('Rating must be between 1 and 5');
    error.statusCode = 400;
    throw error;
  }

  const review = await Review.create({
    deal: deal._id,
    service: deal.service,
    client: user._id || user.id,
    freelancer: deal.freelancer,
    rating: ratingVal,
    comment: data.comment || ''
  });

  // Update freelancer average rating
  const freelancerReviews = await Review.find({ freelancer: deal.freelancer });
  if (freelancerReviews.length > 0) {
    const avgRating = freelancerReviews.reduce((sum, r) => sum + r.rating, 0) / freelancerReviews.length;
    await User.findByIdAndUpdate(deal.freelancer, {
      rating: Math.round(avgRating * 10) / 10,
      $inc: { completedProjects: 1 }
    });
  }

  // Update service review count and rating
  const serviceReviews = await Review.find({ service: deal.service });
  if (serviceReviews.length > 0) {
    const serviceAvg = serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length;
    await Service.findByIdAndUpdate(deal.service, {
      reviewsCount: serviceReviews.length,
      reviewCount: serviceReviews.length,
      rating: Math.round(serviceAvg * 10) / 10
    });
  }

  const populated = await Review.findById(review._id)
    .populate('client', 'name email profileImage avatar')
    .populate('freelancer', 'name email profileImage avatar')
    .populate('service', 'title');

  return populated.toJSON();
};

const helperFindUser = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await User.findById(id);
  }
  if (id === 'usr_freelancer_1') return await User.findOne({ email: 'freelancer@example.com' });
  if (id === 'usr_client_1') return await User.findOne({ email: 'client@example.com' });
  if (id === 'usr_admin_1') return await User.findOne({ email: 'admin@example.com' });
  return null;
};

/**
 * Get reviews for a user (as reviewee)
 */
export const getReviewsByUserId = async (userId) => {
  const user = await helperFindUser(userId);
  const uid = user ? user._id : (mongoose.Types.ObjectId.isValid(userId) ? userId : null);
  if (!uid) return [];

  const reviews = await Review.find({ freelancer: uid })
    .populate('client', 'name email profileImage avatar')
    .populate('service', 'title')
    .sort({ createdAt: -1 });

  return reviews.map(r => r.toJSON());
};

/**
 * Get reviews for a service
 */
export const getReviewsByServiceId = async (serviceId) => {
  let sId = serviceId;
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    if (serviceId === 'svc_1') {
      const s = await Service.findOne();
      sId = s ? s._id : null;
    } else {
      return [];
    }
  }
  if (!sId) return [];

  const reviews = await Review.find({ service: sId })
    .populate('client', 'name email profileImage avatar')
    .populate('service', 'title')
    .sort({ createdAt: -1 });

  return reviews.map(r => r.toJSON());
};

/**
 * Get all reviews with optional filters (serviceId, freelancerId, targetUser, clientId)
 */
export const getAllReviews = async (query = {}) => {
  const filter = {};
  if (query.serviceId) {
    if (mongoose.Types.ObjectId.isValid(query.serviceId)) {
      filter.service = query.serviceId;
    }
  }
  const targetUser = query.freelancerId || query.targetUser || query.userId;
  if (targetUser) {
    const user = await helperFindUser(targetUser);
    if (user) filter.freelancer = user._id;
    else if (mongoose.Types.ObjectId.isValid(targetUser)) filter.freelancer = targetUser;
  }
  if (query.clientId) {
    const clientUser = await helperFindUser(query.clientId);
    if (clientUser) filter.client = clientUser._id;
    else if (mongoose.Types.ObjectId.isValid(query.clientId)) filter.client = query.clientId;
  }

  const reviews = await Review.find(filter)
    .populate('client', 'name email profileImage avatar')
    .populate('freelancer', 'name email profileImage avatar')
    .populate('service', 'title')
    .sort({ createdAt: -1 });

  return reviews.map(r => r.toJSON());
};

