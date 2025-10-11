import axios from 'axios';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const chapterService = {
  async createChapters(chapterData) {
    const response = await axios.post(`/chapters`, chapterData);
    return response.data;
  },
  async editChapters(chapterData) {
    const response = await axios.put(`/chapters`, chapterData);
    return response.data;
  },
  async getChapterByNovelId(novelId, page, pageSize) {
    const response = await axios.get(`/chapters/novel/${novelId}`, {
      params: {
        page,
        pageSize,
      },
    });
    return response.data;
  },
  async getNextChapterNumber(novelId) {
    const response = await axios.get(`/chapters/novel/${novelId}/next-number`);
    return response.data;
  },
  async deleteChapterByChapterId(chapterId) {
    const response = await axios.delete(`/chapters/${chapterId}`);
    return response.data;
  },
  async getChapterByChapterId(chapterId) {
    const response = await axios.get(`/chapters/${chapterId}`);
    return response.data;
  },
};

export default chapterService;
