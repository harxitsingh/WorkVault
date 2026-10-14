import api from './api';

export const serviceService = {
  getServices: async (filters = {}) => {
    try {
      const response = await api.get('/services', { params: filters });
      return response.data.data || [];
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch services';
      throw new Error(message);
    }
  },

  getServiceById: async (id) => {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Service not found';
      throw new Error(message);
    }
  },

  getServicesByFreelancer: async (freelancerId) => {
    try {
      if (!freelancerId) return [];
      const response = await api.get('/services', {
        params: { freelancer: freelancerId, status: 'all' }
      });
      return response.data.data || [];
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch freelancer services';
      throw new Error(message);
    }
  },

  createService: async (data) => {
    try {
      const response = await api.post('/services', data);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.message || 'Failed to create service';
      throw new Error(message);
    }
  },

  updateService: async (id, data) => {
    try {
      const response = await api.put(`/services/${id}`, data);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.message || 'Failed to update service';
      throw new Error(message);
    }
  },

  deleteService: async (id) => {
    try {
      const response = await api.delete(`/services/${id}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete service';
      throw new Error(message);
    }
  }
};

export default serviceService;
