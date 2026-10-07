import { apiGet, apiPut, apiDelete } from './client';

export const usersApi = {
  getAll: () => apiGet('/user/alluser'),
  update: (id, payload) => apiPut(`/user/update/${id}`, payload),
  remove: (id) => apiDelete(`/user/delete/${id}`),
};