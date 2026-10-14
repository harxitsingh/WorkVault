import api from './api';

const getErrorMessage = (error, fallback) => (
  error.response?.data?.message || error.message || fallback
);

export const dealService = {
  getDeals: async (filters = {}) => {
    try {
      const response = await api.get('/deals', { params: filters });
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch deals'));
    }
  },
  
  getDealById: async (id) => {
    try {
      const response = await api.get(`/deals/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Deal not found'));
    }
  },
  
  getDealsByClient: async (clientId) => {
    return dealService.getDeals({ client: clientId });
  },
  
  getDealsByFreelancer: async (freelancerId) => {
    return dealService.getDeals({ freelancer: freelancerId });
  },
  
  createDeal: async (data) => {
    try {
      const response = await api.post('/deals', data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create deal'));
    }
  },
  
  updateDealStatus: async (id, status) => {
    try {
      const response = await api.put(`/deals/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update deal'));
    }
  },
  
  submitDelivery: async (id, data) => {
    try {
      const response = await api.post(`/deals/${id}/submit`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to submit delivery'));
    }
  },
  
  approveDelivery: async (id) => {
    try {
      const response = await api.post(`/deals/${id}/approve`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to approve delivery'));
    }
  },
  
  requestRevision: async (id, message) => {
    return dealService.updateDealStatus(id, 'IN_PROGRESS', { message });
  }
};

export default dealService;
