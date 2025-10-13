import axios from 'axios';

const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';
const authHeader = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const historyService = {
  async getHistoryNovels(filters) {
    const response = await axios.get(`${BASE}/history`, { headers: authHeader(), params: filters });
    return response.data.data;
  },
  async deleteHistoryById(historyId) {
    const response = await axios.delete(`${BASE}/history/${historyId}`, { headers: authHeader() });
    return response.data;
  },
  async clearHistory() {
    const response = await axios.delete(`${BASE}/history/clear`, { headers: authHeader() });
    return response.data;
  },
};

export default historyService;
