import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const novelService = {
  async createNovel(novelData) {
    const response = await axios.post(`${API_URL}/novels`, novelData);
    return response.data.data;
  },
  async getNovel(filters) {
    const response = await axios.get(`${API_URL}/novels`, {
      params: filters,
    });
    return response.data.data.content;
  },
  async getNovelById(novelId) {
    const response = await axios.get(`${API_URL}/novels/${novelId}`);
    return response.data.data;
  },
  async hideNovelById(novelId) {
    const response = await axios.post(`${API_URL}/novels/${novelId}/hide`);
    return response.data;
  },
  async unHideNovelById(novelId) {
    const response = await axios.post(`${API_URL}/novels/${novelId}/unhide`);
    return response.data;
  },
  async changeNovelDetailById(novelId, novelData) {
    const response = await axios.put(`${API_URL}/novels/${novelId}`, novelData);
    return response.data.data;
  },
  async submitNovelForReview(novelId) {
    const response = await axios.post(`${API_URL}/novels/${novelId}/submit-review`);
    return response.data;
  },
  async deleteNovelById(novelId) {
    const response = await axios.post(`${API_URL}/novels/${novelId}/archive`);
    return response.data;
  },
};

export default novelService;
