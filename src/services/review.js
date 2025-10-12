import axios from 'axios';

const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';
const authHeader = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const reviewService = {
  async getReviewsByNovelId(novelId, filters) {
    const response = await axios.get(`${BASE}/reviews/novel/${novelId}`, {
      params: filters,
      headers: authHeader(),
    });
    return response.data.data.content;
  },
};

export default reviewService;
