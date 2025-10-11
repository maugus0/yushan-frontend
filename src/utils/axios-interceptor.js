// src/utils/axios-interceptor.js
import axios from 'axios';
import authService from '../services/auth';
import store from '../store';

let isRedirecting = false;

axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/send-email');

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshToken();

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return axios(originalRequest);
      } catch (refreshError) {
        if (!isRedirecting) {
          isRedirecting = true;

          authService.clearTokens();

          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register') {
            window.location.href = '/login';
          }

          setTimeout(() => {
            isRedirecting = false;
          }, 1000);
        }

        return Promise.reject(refreshError);
      }
    }

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - resource exhaustion prevented');
    }

    if (error.message?.includes('rate limit')) {
      console.warn('Rate limit exceeded - throttling in effect');
    }

    return Promise.reject(error);
  }
);

export default axios;
