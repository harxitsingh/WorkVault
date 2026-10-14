import { User } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import mongoose from 'mongoose';

const findUserById = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await User.findById(id).select('+password');
  }
  return await User.findOne({ _id: id }).select('+password');
};

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password, role = 'client' }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    profileImage: avatarUrl,
    avatar: avatarUrl
  });

  const userJson = user.toJSON();
  const token = generateToken({ id: userJson.id, email: userJson.email, role: userJson.role });

  return { user: userJson, token };
};

/**
 * Login with email and password
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const userJson = user.toJSON();
  const token = generateToken({ id: userJson.id, email: userJson.email, role: userJson.role });

  return { user: userJson, token };
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (userId) => {
  let user;
  if (mongoose.Types.ObjectId.isValid(userId)) {
    user = await User.findById(userId);
  } else {
    user = await User.findOne({ _id: userId });
  }

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user.toJSON();
};

/**
 * Switch role for authenticated user (persisted in DB and returns a new JWT)
 */
export const switchUserRole = async (userId, targetRole) => {
  const allowedRoles = ['client', 'freelancer', 'admin'];
  if (!allowedRoles.includes(targetRole)) {
    const error = new Error(`Invalid role: ${targetRole}. Must be one of: ${allowedRoles.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  let user;
  if (mongoose.Types.ObjectId.isValid(userId)) {
    user = await User.findById(userId);
  } else {
    user = await User.findOne({ _id: userId });
  }

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Non-admins cannot promote themselves to admin
  if (targetRole === 'admin' && user.role !== 'admin') {
    const error = new Error('Unauthorized. Admin role requires administrative privileges.');
    error.statusCode = 403;
    throw error;
  }

  user.role = targetRole;
  await user.save();

  const userJson = user.toJSON();
  const token = generateToken({ id: userJson.id, email: userJson.email, role: userJson.role });

  return { user: userJson, token };
};
