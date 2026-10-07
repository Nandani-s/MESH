import { apiGet, apiPost, apiPut, apiDelete } from './client';

export const categoryApi = {
  getAll: () => apiGet('/category'),
  create: (payload) => apiPost('/category', payload),
  update: (id, payload) => apiPut(`/category/${id}`, payload),
  remove: (id) => apiDelete(`/category/${id}`),
};