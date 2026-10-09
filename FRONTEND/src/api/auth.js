import { apiGet, apiPost, apiPutMultipart } from './client';

export const authApi = {
  register: (payload) => apiPost('/user/register', payload),
  login: (payload) => apiPost('/user/login', payload),
  logout: () => apiPost('/user/logout'),
  // Hits the protected /auth route; the httpOnly cookie authenticates this
  // request automatically, no token handling needed on the frontend.
  getCurrentUser: () => apiGet('/user/auth'),
  uploadAvatar: (formData) => apiPutMultipart('/user/profile/avatar', formData),
};