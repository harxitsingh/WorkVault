import api from './api';

const getErrorMessage = (error, fallback) => (
  error.response?.data?.message || error.message || fallback
);

export const milestoneService = {
  getMilestonesByDeal: async (dealId) => {
    try {
      const response = await api.get(`/deals/${dealId}/milestones`);
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch milestones'));
    }
  },

  getMilestoneById: async (id) => {
    try {
      const response = await api.get(`/milestones/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch milestone details'));
    }
  },

  createMilestone: async (dealId, data) => {
    try {
      const response = await api.post(`/deals/${dealId}/milestones`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create milestone'));
    }
  },

  fundMilestone: async (id, paymentReference = '') => {
    try {
      const response = await api.post(`/milestones/${id}/fund`, { paymentReference });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fund milestone'));
    }
  },

  startMilestoneWork: async (id) => {
    try {
      const response = await api.post(`/milestones/${id}/start`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update milestone progress'));
    }
  },

  submitMilestoneWork: async (id, data) => {
    try {
      const response = await api.post(`/milestones/${id}/submit`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to submit milestone work'));
    }
  },

  requestMilestoneRevision: async (id, data) => {
    try {
      const response = await api.post(`/milestones/${id}/revision`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to request revision'));
    }
  },

  approveAndReleaseMilestone: async (id) => {
    try {
      const response = await api.post(`/milestones/${id}/approve`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to approve milestone'));
    }
  }
};

export default milestoneService;
