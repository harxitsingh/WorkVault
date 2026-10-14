import { sendError } from '../utils/response.js';
import { config } from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id: ${err.value}`;
  }

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
  }

  return sendError(res, message, statusCode);
};

export const notFoundHandler = (req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};
