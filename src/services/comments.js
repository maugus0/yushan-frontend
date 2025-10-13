import axios from 'axios';

const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';
const authHeader = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const commentService = {
  async getCommentsByNovelId(filters) {
    const { novelId, ...restFilters } = filters;
    const response = await axios.get(`${BASE}/comments/novel/${novelId}`, {
      params: restFilters,
      headers: authHeader(),
    });
    return response.data.data;
  },
};

export default commentService;
