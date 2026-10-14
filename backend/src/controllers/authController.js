import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id || req.user._id);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const switchRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const result = await authService.switchUserRole(req.user.id || req.user._id, role);
    sendSuccess(res, result, 200, null, 'Role switched successfully');
  } catch (error) {
    next(error);
  }
};
