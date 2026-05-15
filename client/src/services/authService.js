import api from './api';

const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (resetToken, password) => {
    const response = await api.post(`/auth/reset-password/${resetToken}`, {
      password,
    });
    return response.data;
  },

  // Update user details
  updateDetails: async (userData) => {
    const response = await api.put('/auth/update-details', userData);
    return response.data;
  },

  // Update password
  updatePassword: async (passwords) => {
    const response = await api.put('/auth/update-password', passwords);
    return response.data;
  },
};

export default authService;
