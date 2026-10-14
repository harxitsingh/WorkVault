import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Review } from '../models/Review.js';
import mongoose from 'mongoose';

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
 * Get user by ID (no password)
 */
export const getUserById = async (id) => {
  const user = await helperFindUser(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user.toJSON();
};

/**
 * Update user profile
 */
export const updateUser = async (id, updates, requesterId) => {
  const user = await helperFindUser(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const requester = await helperFindUser(requesterId);
  const userTargetId = user._id.toString();
  const reqUserId = requester ? requester._id.toString() : requesterId?.toString();

  if (userTargetId !== reqUserId && requester?.role !== 'admin') {
    const error = new Error('You can only update your own profile');
    error.statusCode = 403;
    throw error;
  }

  const allowedFields = ['name', 'bio', 'skills', 'avatar', 'profileImage', 'title', 'location', 'phone', 'company', 'portfolioUrl', 'settings'];
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      user[key] = updates[key];
    }
  }
  if (updates.avatar && !updates.profileImage) user.profileImage = updates.avatar;
  if (updates.profileImage && !updates.avatar) user.avatar = updates.profileImage;
  if (requester?.role === 'admin' && updates.status !== undefined) {
    user.status = updates.status;
  }

  await user.save();
  return user.toJSON();
};

/**
 * Get services by user (freelancer) ID
 */
export const getUserServices = async (userId) => {
  const user = await helperFindUser(userId);
  const uid = user ? user._id : (mongoose.Types.ObjectId.isValid(userId) ? userId : null);
  if (!uid) return [];

  const services = await Service.find({ freelancer: uid }).populate('freelancer', 'name avatar profileImage rating');
  return services.map(s => s.toJSON());
};

/**
 * Get reviews for a user (freelancer)
 */
export const getUserReviews = async (userId) => {
  const user = await helperFindUser(userId);
  const uid = user ? user._id : (mongoose.Types.ObjectId.isValid(userId) ? userId : null);
  if (!uid) return [];

  const reviews = await Review.find({ freelancer: uid })
    .populate('client', 'name avatar profileImage')
    .populate('service', 'title');
  return reviews.map(r => r.toJSON());
};
