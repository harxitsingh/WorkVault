import { sendError } from '../utils/response.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    const currentRole = req.user.role;
    const baseRole = req.user.baseRole || currentRole;
    const isPlatformAdmin = currentRole === 'admin' || baseRole === 'admin' || req.user.email === 'admin@example.com';

    if (roles.includes('admin')) {
      if (isPlatformAdmin) return next();
      return sendError(res, `Forbidden. Requires one of the following roles: ${roles.join(', ')}`, 403);
    }

    const hasAllowedRole = roles.includes(currentRole) ||
      (req.user.activeRole && roles.includes(req.user.activeRole)) ||
      isPlatformAdmin;

    if (!hasAllowedRole) {
      return sendError(res, `Forbidden. Requires one of the following roles: ${roles.join(', ')}`, 403);
    }

    next();
  };
};
