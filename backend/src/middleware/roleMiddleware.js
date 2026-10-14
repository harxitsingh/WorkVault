import { sendError } from '../utils/response.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, `Forbidden. Requires one of the following roles: ${roles.join(', ')}`, 403);
    }

    next();
  };
};
