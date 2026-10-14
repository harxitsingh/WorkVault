import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data.data; // { user, token }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  },

  register: async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data.data; // { user, token }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user';
      throw new Error(message);
    }
  },

  switchRole: async (role) => {
    try {
      const response = await api.post('/auth/switch-role', { role });
      return response.data.data; // { user, token }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to switch role';
      throw new Error(message);
    }
  },

  forgotPassword: async (email) => {
    return { message: 'Password reset link sent successfully.' };
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('workvault_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};

export default authService;
