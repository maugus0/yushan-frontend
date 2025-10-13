import { http, authHeader } from './_http';
import axios from 'axios';

const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';

const commentsApi = {
  async listByChapter(chapterId, { page = 0, size = 20 } = {}) {
    const res = await http.get(`/comments/chapter/${chapterId}`, {
      params: { page, size, sort: 'createTime', order: 'desc' },
      headers: authHeader(),
    });
    return res?.data?.data;
  },
  async create({ chapterId, content }) {
    const res = await http.post(
      `/comments`,
      { chapterId, content, isSpoiler: false },
      { headers: authHeader() }
    );
    return res?.data?.data;
  },
  async getCommentsByNovelId(filters) {
    const { novelId, ...restFilters } = filters;
    const response = await axios.get(`${BASE}/comments/novel/${novelId}`, {
      params: restFilters,
      headers: authHeader(),
    });
    return response.data.data;
  },
};
export default commentsApi;
