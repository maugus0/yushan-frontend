// Real backend API for rankings. Uses CRA dev proxy: package.json "proxy": "http://localhost:8080/api"
import axios from 'axios';

// Use same convention as auth.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// In development use CRA proxy (baseURL=''), in production call API_URL directly
const isProd = process.env.NODE_ENV === 'production';
const BASE = isProd ? API_URL : ''; // dev: '' -> requests go to /ranking/* and are proxied

// Read JWT from localStorage (auth.js uses 'jwt_token')
function authHeader() {
  const t = localStorage.getItem('jwt_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Normalize backend paging payload to the shape expected by the page
function normalizePage(resp) {
  const d = resp?.data?.data ?? {};
  const content = Array.isArray(d.content) ? d.content : [];
  return {
    items: content,
    total: d.totalElements ?? content.length ?? 0,
    page: (d.currentPage ?? 0) + 1, // backend 0-based -> UI 1-based
    size: d.size ?? content.length ?? 0,
    raw: d,
  };
}

export default {
  // GET /api/ranking/novel
  async getNovels({ page = 1, size = 20, categoryName } = {}) {
    const params = { page: page - 1, size };
    if (categoryName) params.categoryName = categoryName; // optional filter
    const res = await axios.get(`${BASE}/ranking/novel`, {
      params,
      headers: authHeader(),
    });
    return normalizePage(res);
  },

  // GET /api/ranking/user (readers)
  async getReaders({ page = 1, size = 20 } = {}) {
    const res = await axios.get(`${BASE}/ranking/user`, {
      params: { page: page - 1, size },
      headers: authHeader(),
    });
    return normalizePage(res);
  },

  // GET /api/ranking/author (writers)
  async getWriters({ page = 1, size = 20 } = {}) {
    const res = await axios.get(`${BASE}/ranking/author`, {
      params: { page: page - 1, size },
      headers: authHeader(),
    });
    return normalizePage(res);
  },
};
