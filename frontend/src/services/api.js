/**
 * Axios instance pre-configured for the Task Management API.
 *
 * - Base URL is read from VITE_API_URL environment variable.
 * - Request interceptor injects the JWT from localStorage on every call.
 * - Response interceptor converts 401 responses into a consistent error
 *   so components can handle expired/invalid sessions uniformly.
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalise error responses so callers get a readable message string
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401, the session is expired — clear storage and reload
    if (error.response?.status === 401) {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
