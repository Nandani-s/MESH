import { apiGet, apiPost, apiPut, apiDelete } from './client';

export const cartApi = {
  getCart: () => apiGet('/cart'),
  addToCart: (productId, quantity = 1) => apiPost(`/cart/${productId}`, { quantity }),
  updateQuantity: (productId, quantity) => apiPut(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => apiDelete(`/cart/${productId}`),
  clearCart: () => apiDelete('/cart/clear'),
};
