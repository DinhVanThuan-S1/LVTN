/**
 * User API Service
 */
import api from './api';

const userService = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  uploadAvatar: (formData) =>
    api.put('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default userService;
