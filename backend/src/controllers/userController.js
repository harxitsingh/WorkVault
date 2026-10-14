import * as userService from '../services/userService.js';
import { sendSuccess } from '../utils/response.js';

export const getUser = async (req, res, next) => {
  try {
    const targetId = req.params.id === 'me' && req.user ? (req.user.id || req.user._id) : req.params.id;
    const user = await userService.getUserById(targetId);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const requesterId = req.user.id || req.user._id;
    const targetId = req.params.id === 'me' ? requesterId : req.params.id;
    const user = await userService.updateUser(targetId, req.body, requesterId);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const getUserServices = async (req, res, next) => {
  try {
    const services = await userService.getUserServices(req.params.id);
    sendSuccess(res, services);
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await userService.getUserReviews(req.params.id);
    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
};
