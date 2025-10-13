import axios from 'axios';

const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';
const authHeader = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const novelService = {
  async createNovel(novelData) {
    const response = await axios.post(`${BASE}/novels`, novelData, { headers: authHeader() });
    return response.data.data;
  },
  async getNovel(filters) {
    const response = await axios.get(`${BASE}/novels`, {
      params: filters,
      headers: authHeader(),
    });
    return response.data.data.content;
  },
  async getNovelById(novelId) {
    const response = await axios.get(`${BASE}/novels/${novelId}`, { headers: authHeader() });
    return response.data.data;
  },
  async hideNovelById(novelId) {
    const response = await axios.post(
      `${BASE}/novels/${novelId}/hide`,
      {},
      { headers: authHeader() }
    );
    return response.data;
  },
  async unHideNovelById(novelId) {
    const response = await axios.post(
      `${BASE}/novels/${novelId}/unhide`,
      {},
      { headers: authHeader() }
    );
    return response.data;
  },
  async changeNovelDetailById(novelId, novelData) {
    console.log('Changing novel detail for id:', novelId, 'with data:', novelData);
    const response = await axios.put(`${BASE}/novels/${novelId}`, novelData, {
      headers: authHeader(),
    });
    return response.data.data;
  },
  async submitNovelForReview(novelId) {
    const response = await axios.post(
      `${BASE}/novels/${novelId}/submit-review`,
      {},
      { headers: authHeader() }
    );
    return response.data;
  },
  async deleteNovelById(novelId) {
    const response = await axios.post(
      `${BASE}/novels/${novelId}/archive`,
      {},
      { headers: authHeader() }
    );
    return response.data;
  },
};

export default novelService;
