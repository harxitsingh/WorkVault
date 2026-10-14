import api from './api';

const getErrorMessage = (error, fallback) => (
  error.response?.data?.message || error.message || fallback
);

export const paymentService = {
  getTransactions: async (filters = {}) => {
    try {
      const response = await api.get('/transactions', { params: filters });
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch transactions'));
    }
  },

  getTransactionsByUser: async (userId) => {
    return paymentService.getTransactions({ user: userId });
  },

  getPaymentSummary: async () => {
    try {
      const response = await api.get('/withdrawals/balance');
      return response.data.data;
    } catch (error) {
      // Fallback to transactions
      const transactionList = await paymentService.getTransactions();
      return {
        availableBalance: transactionList
          .filter(t => ['RELEASED', 'released'].includes(t.status))
          .reduce((sum, t) => sum + t.amount, 0),
        held: transactionList
          .filter(t => ['HELD', 'held'].includes(t.status))
          .reduce((sum, t) => sum + t.amount, 0)
      };
    }
  },

  createCheckoutSession: async ({ milestoneId, successUrl, cancelUrl }) => {
    try {
      const response = await api.post('/payments/create-checkout-session', {
        milestoneId,
        successUrl,
        cancelUrl
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create checkout session'));
    }
  },

  confirmTestPayment: async ({ milestoneId, paymentReference }) => {
    try {
      const response = await api.post('/payments/confirm-test-payment', {
        milestoneId,
        paymentReference
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to confirm payment'));
    }
  },

  getAvailableBalance: async () => {
    try {
      const response = await api.get('/withdrawals/balance');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch available balance'));
    }
  },

  requestWithdrawal: async (data) => {
    try {
      const response = await api.post('/withdrawals', data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to process withdrawal'));
    }
  },

  getWithdrawals: async () => {
    try {
      const response = await api.get('/withdrawals');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch withdrawals'));
    }
  },

  downloadStatement: async () => {
    try {
      const response = await api.get('/transactions/statement', {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `workvault-statement-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to download statement'));
    }
  }
};

export default paymentService;
