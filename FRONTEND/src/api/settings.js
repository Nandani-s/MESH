import { apiGet, apiPut } from './client';

export const settingsApi = {
  get: () => apiGet('/settings'),
  update: (payload) => apiPut('/settings', payload),
};