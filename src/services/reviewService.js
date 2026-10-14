import api from './api';

const getErrorMessage = (error, fallback) => (
  error.response?.data?.message || error.message || fallback
);

export const reviewService = {
  getReviewsByService: async (serviceId) => {
    try {
      const response = await api.get('/reviews', { params: { serviceId } });
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch reviews'));
    }
  },

  getReviewsByUser: async (userId) => {
    try {
      const response = await api.get('/reviews', { params: { targetUser: userId } });
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch user reviews'));
    }
  },

  getAllReviews: async (params = {}) => {
    try {
      const response = await api.get('/reviews', { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch all reviews'));
    }
  },

  createReview: async (data) => {
    try {
      const response = await api.post('/reviews', data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to submit review'));
    }
  }
};

export default reviewService;
