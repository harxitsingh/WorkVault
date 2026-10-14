import * as serviceService from '../services/serviceService.js';
import { sendSuccess } from '../utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const result = await serviceService.getAllServices(req.query);
    sendSuccess(res, result.data, 200, { pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    sendSuccess(res, service);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const service = await serviceService.createService(req.body, req.user);
    sendSuccess(res, service, 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const service = await serviceService.updateService(req.params.id, req.body, req.user.id || req.user._id);
    sendSuccess(res, service);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const service = await serviceService.deleteService(req.params.id, req.user.id || req.user._id, req.user.role);
    sendSuccess(res, { message: 'Service deleted', id: service.id });
  } catch (error) {
    next(error);
  }
};
