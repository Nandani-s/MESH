import { apiGet, apiPut, apiDelete, apiPostMultipart, apiPutMultipart } from './client';

export const productApi = {
  getAll: () => apiGet('/product'),
  getById: (id) => apiGet(`/product/${id}`),
  // formData must be a FormData instance (includes the image file for create;
  // optional for update — omit it to keep the existing image).
  create: (formData) => apiPostMultipart('/product/create', formData),
  update: (id, formData) => apiPutMultipart(`/product/${id}`, formData),
  // For field-only updates with no image change (e.g. toggling availability) —
  // plain JSON, no multipart overhead.
  updateFields: (id, payload) => apiPut(`/product/${id}`, payload),
  remove: (id) => apiDelete(`/product/${id}`),
};