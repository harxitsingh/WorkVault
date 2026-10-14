import api from './api';

const getErrorMessage = (error, fallback) => (
  error.response?.data?.message || error.message || fallback
);

export const statsService = {
  getFreelancerStats: async () => {
    try {
      const response = await api.get('/stats/freelancer');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch freelancer stats'));
    }
  },

  getClientStats: async () => {
    try {
      const response = await api.get('/stats/client');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch client stats'));
    }
  },

  getAdminStats: async () => {
    try {
      const response = await api.get('/stats/admin');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch admin stats'));
    }
  },

  getTrustMetrics: async (userId = null) => {
    try {
      const endpoint = userId ? `/users/${userId}/trust-metrics` : '/stats/trust';
      const response = await api.get(endpoint);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to calculate trust metrics'));
    }
  },

  search: async (q) => {
    try {
      const response = await api.get('/search', { params: { q } });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Search failed'));
    }
  },

  uploadFile: async (file, categoryOrField = 'general') => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      // If service_images is passed as upload field/type, map to valid category 'service'
      const category = (categoryOrField === 'service_images' || categoryOrField === 'service')
        ? 'service'
        : categoryOrField;
      formData.append('category', category);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const data = response.data.data;
      if (data) {
        data.url = data.fullUrl || data.url || data.fileUrl;
      }
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'File upload failed'));
    }
  }
};

export default statsService;
