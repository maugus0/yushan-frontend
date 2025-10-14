// Shared helpers for API base and auth header
import axios from 'axios';
import authService from './auth';

export const API_BASE = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');

export function authHeader() {
  const t = localStorage.getItem('jwt_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function toAbsoluteUrl(u) {
  if (!u) return undefined;
  const s = String(u).trim();
  if (/^https?:\/\//i.test(s) || /^data:/i.test(s)) return s;
  return `${API_BASE}/${s
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .replace(/^api\/+/i, '')}`;
}

export const http = axios.create({
  baseURL: API_BASE,
});

// Attach token per request
http.interceptors.request.use((config) => {
  const t = localStorage.getItem('jwt_token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 401
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await authService.refreshToken();
          isRefreshing = false;
          onRefreshed(newToken);
        } catch (e) {
          isRefreshing = false;
          authService.handleUnauthorized(); // to login page
          return Promise.reject(e);
        }
      }
      // wait for token
      return new Promise((resolve) => {
        refreshSubscribers.push((token) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          resolve(http(originalRequest));
        });
      });
    }
    return Promise.reject(error);
  }
);
