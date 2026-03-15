import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token (only if we have a real token string)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && typeof token === 'string' && token.length > 0 && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Single in-flight refresh: avoid multiple 401s each triggering a separate refresh call
let refreshPromise = null;

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const url = originalRequest.url || '';
    const isLoginOrRegister = url.includes('/auth/login') || url.includes('/auth/register');
    const isRefreshRequest = url.includes('/auth/refresh');

    // Don't clear session or redirect for login/register errors — let the form show the message
    if (isLoginOrRegister) {
      return Promise.reject(error);
    }

    // If refresh itself failed with 401, clear and redirect once (no retry)
    if (isRefreshRequest && status === 401) {
      refreshPromise = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if ((status === 401 || status === 422) && !originalRequest._retry) {
      if (status === 401) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token');
          }
          // One refresh for all concurrent 401s: reuse in-flight promise
          if (!refreshPromise) {
            refreshPromise = api.post('/auth/refresh', {}, {
              headers: { Authorization: `Bearer ${refreshToken}` }
            });
          }
          const response = await refreshPromise;
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          refreshPromise = null;
          /* fall through to clear and redirect */
        }
      } else {
        refreshPromise = null;
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;