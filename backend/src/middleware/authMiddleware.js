import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required. Token missing or malformed.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    let user;
    if (mongoose.Types.ObjectId.isValid(decoded.id)) {
      user = await User.findById(decoded.id);
    } else {
      user = await User.findOne({ _id: decoded.id });
    }

    if (!user) {
      return sendError(res, 'Invalid token. User no longer exists.', 401);
    }

    req.user = user.toJSON();
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid or corrupted token.', 401);
  }
};
