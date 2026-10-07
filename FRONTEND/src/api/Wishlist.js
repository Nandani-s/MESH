import { apiGet, apiPost, apiDelete } from './client';

export const wishlistApi = {
  getAll: () => apiGet('/wishlist'),
  check: (productId) => apiGet(`/wishlist/check/${productId}`),
  add: (productId) => apiPost(`/wishlist/${productId}`),
  remove: (productId) => apiDelete(`/wishlist/${productId}`),
  clear: () => apiDelete('/wishlist/clear'),
};