import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('workvault_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // When sending FormData, remove Content-Type so browser/axios sets multipart boundary
  if (config.data instanceof FormData) {
    if (config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      } else {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }
  } else if (config.headers && !config.headers['Content-Type'] && !config.headers['content-type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

export const formatApiError = (error) => {
  if (!error.response) {
    return 'Unable to reach the WorkVault server. Please check your network connection.';
  }

  const status = error.response.status;
  const rawMsg = error.response.data?.message;

  if (status === 403) {
    if (rawMsg?.includes('Requires one of the following roles: freelancer')) {
      return 'Freelancer account required. Please switch your role to Freelancer from the sidebar.';
    }
    if (rawMsg?.includes('Requires one of the following roles: client')) {
      return 'Client account required. Please switch your role to Client from the sidebar.';
    }
    if (rawMsg?.includes('Requires one of the following roles: admin') || rawMsg?.includes('admin')) {
      return 'Access denied. Administrator privileges are required.';
    }
    return rawMsg || 'You do not have permission to perform this action.';
  }

  if (rawMsg) return rawMsg;

  switch (status) {
    case 400: return 'Invalid request. Please check the entered data.';
    case 401: return 'Your session has expired. Please log in again.';
    case 404: return 'The requested item or page could not be found.';
    case 409: return 'A conflicting record already exists in the system.';
    case 422: return 'Validation error. Please verify the required fields.';
    case 500: return 'Server error. Our engineering team has been notified.';
    default: return error.message || 'An unexpected error occurred.';
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('workvault_token');
      localStorage.removeItem('workvault_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    error.userMessage = formatApiError(error);
    // Set descriptive message on Error object for catch blocks using err.message
    error.message = error.userMessage;
    return Promise.reject(error);
  }
);

export default api;
