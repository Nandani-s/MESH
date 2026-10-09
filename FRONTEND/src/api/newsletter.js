import { apiDelete, apiGet, apiPost, apiPut } from './client';

export const newsletterApi = {
  subscribe: (email) => apiPost('/newsletter/subscribe', { email }),
  unsubscribe: (email) => apiPost('/newsletter/unsubscribe', { email }),
  getAll: () => apiGet('/newsletter'),
  update: (id, payload) => apiPut(`/newsletter/${id}`, payload),
  remove: (id) => apiDelete(`/newsletter/${id}`),
};
