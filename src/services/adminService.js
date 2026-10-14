import api from './api';

const getErrorMessage = (error, fallback) => (
  error.response?.data?.message || error.message || fallback
);

export const adminService = {
  getUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch users'));
    }
  },

  getServices: async () => {
    try {
      const response = await api.get('/admin/services');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch services'));
    }
  },

  getDeals: async () => {
    try {
      const response = await api.get('/admin/deals');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch deals'));
    }
  },

  getTransactions: async () => {
    try {
      const response = await api.get('/admin/transactions');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch transactions'));
    }
  },

  getDisputes: async () => {
    try {
      const response = await api.get('/admin/disputes');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch disputes'));
    }
  },

  resolveDispute: async (id, data) => {
    try {
      const response = await api.post(`/disputes/${id}/resolve`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to resolve dispute'));
    }
  },

  updateUserStatus: async (userId, data) => {
    try {
      const response = await api.put(`/users/${userId}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update user'));
    }
  }
};

export default adminService;
