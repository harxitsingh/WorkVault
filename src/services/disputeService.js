import api from './api';

const getErrorMessage = (error, fallback) => (
  error.response?.data?.message || error.message || fallback
);

export const disputeService = {
  getDisputes: async (filters = {}) => {
    try {
      const response = await api.get('/disputes', { params: filters });
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch disputes'));
    }
  },

  getDisputeById: async (id) => {
    try {
      const response = await api.get(`/disputes/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Dispute not found'));
    }
  },

  createDispute: async (data) => {
    try {
      const response = await api.post('/disputes', data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to open dispute'));
    }
  },

  addEvidence: async (id, evidenceData) => {
    try {
      const response = await api.post(`/disputes/${id}/evidence`, evidenceData);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to attach evidence'));
    }
  },

  resolveDispute: async (id, { decision, resolutionNotes }) => {
    try {
      const response = await api.post(`/disputes/${id}/resolve`, {
        decision,
        resolutionNotes
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to resolve dispute'));
    }
  },

  updateDisputeStatus: async (id, status, resolution) => {
    try {
      const response = await api.put(`/disputes/${id}/status`, { status, resolution });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update dispute status'));
    }
  }
};

export default disputeService;
