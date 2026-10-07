// Centralized API client.
//
// Why this exists: without it, every component would hardcode its own
// `fetch('http://localhost:5000/api/...')` call, repeat the
// `credentials: 'include'` option, and parse errors differently. One place
// to change the base URL (e.g. for staging/prod) and one error shape for
// every component to handle.

// Set VITE_API_URL in your frontend .env (e.g. VITE_API_URL=http://localhost:5000/api).
// Falls back to localhost:5000 so it still works if you haven't added the env var yet.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * @param {string} path - e.g. '/user/login'
 * @param {RequestInit} [options]
 */
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include', // required so the httpOnly JWT cookie is sent/received
    cache: 'no-store',      // ← ADDED: never use browser cache for API calls
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',   // ← ADDED: ask server not to cache
      ...options.headers,
    },
    ...options,
  });

  // Backend always returns JSON, even on errors (see authController.js)
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong', response.status, data);
  }

  return data;
}

export const apiGet = (path) => apiRequest(path, { method: 'GET' });

export const apiPost = (path, body) =>
  apiRequest(path, { method: 'POST', body: JSON.stringify(body) });

export const apiPut = (path, body) =>
  apiRequest(path, { method: 'PUT', body: JSON.stringify(body) });

export const apiDelete = (path) => apiRequest(path, { method: 'DELETE' });

// For file uploads (FormData bodies). Deliberately does NOT set
// Content-Type — the browser sets `multipart/form-data; boundary=...`
// automatically, and setting it manually breaks the upload.
async function apiRequestMultipart(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    cache: 'no-store',      // ← ADDED
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong', response.status, data);
  }

  return data;
}

export const apiPostMultipart = (path, formData) =>
  apiRequestMultipart(path, { method: 'POST', body: formData });

export const apiPutMultipart = (path, formData) =>
  apiRequestMultipart(path, { method: 'PUT', body: formData });