import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return sendError(res, firstError, 400);
  }

  next();
};
