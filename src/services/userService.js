import api from './api';

export const userService = {
  getUsers: async (filters = {}) => {
    try {
      const response = await api.get('/admin/users', { params: filters });
      return response.data.data || [];
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch users';
      throw new Error(message);
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user';
      throw new Error(message);
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update user';
      throw new Error(message);
    }
  },

  getUserServices: async (id) => {
    try {
      const response = await api.get(`/users/${id}/services`);
      return response.data.data || [];
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user services';
      throw new Error(message);
    }
  },

  getUserReviews: async (id) => {
    try {
      const response = await api.get(`/users/${id}/reviews`);
      return response.data.data || [];
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user reviews';
      throw new Error(message);
    }
  },

  updateUserStatus: async (id, status) => {
    try {
      const response = await api.put(`/admin/users/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update user status';
      throw new Error(message);
    }
  }
};

export default userService;
