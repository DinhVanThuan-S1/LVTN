/**
 * Auth API Service
 */
import api from './api';

const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  logout: () => api.post('/auth/logout', { refreshToken: localStorage.getItem('refreshToken') }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export default authService;
