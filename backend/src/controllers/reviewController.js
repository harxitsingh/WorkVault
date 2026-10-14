import * as reviewService from '../services/reviewService.js';
import { sendSuccess } from '../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.body, req.user);
    sendSuccess(res, review, 201);
  } catch (error) {
    next(error);
  }
};

export const getByUserId = async (req, res, next) => {
  try {
    const reviews = await reviewService.getReviewsByUserId(req.params.userId);
    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
};

export const getByServiceId = async (req, res, next) => {
  try {
    const reviews = await reviewService.getReviewsByServiceId(req.params.serviceId);
    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const reviews = await reviewService.getAllReviews(req.query);
    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
};
