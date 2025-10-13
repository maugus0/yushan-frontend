import { http, authHeader } from './_http';

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
};
export default commentsApi;
