import axios from 'axios';

const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';
const authHeader = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const chapterService = {
  async createChapters(chapterData) {
    const response = await axios.post(`${BASE}/chapters`, chapterData, { headers: authHeader() });
    return response.data;
  },
  async editChapters(chapterData) {
    const response = await axios.put(`${BASE}/chapters`, chapterData, { headers: authHeader() });
    return response.data;
  },
  async getChapterByNovelId(novelId, page, pageSize) {
    const response = await axios.get(`${BASE}/chapters/novel/${novelId}`, {
      params: { page, pageSize },
      headers: authHeader(),
    });
    return response.data;
  },
  async getNextChapterNumber(novelId) {
    const response = await axios.get(`${BASE}/chapters/novel/${novelId}/next-number`, {
      headers: authHeader(),
    });
    return response.data;
  },
  async deleteChapterByChapterId(chapterId) {
    const response = await axios.delete(`${BASE}/chapters/${chapterId}`, { headers: authHeader() });
    return response.data;
  },
  async getChapterByChapterId(chapterId) {
    const response = await axios.get(`${BASE}/chapters/${chapterId}`, { headers: authHeader() });
    return response.data;
  },
};

export default chapterService;
