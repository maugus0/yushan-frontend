import { http, authHeader } from './_http';

const reviewsApi = {
  async listByNovel(novelId, { page = 0, size = 10, sort = 'createTime', order = 'desc' } = {}) {
    const res = await http.get(`/reviews/novel/${novelId}`, {
      params: { page, size, sort, order },
      headers: authHeader(),
    });
    return res?.data?.data;
  },
  async create({ novelId, rating, text, isSpoiler }) {
    const body = {
      novelId,
      rating,
      title: text, // UI only has one textarea; use same value
      content: text, // UI only has one textarea; use same value
      isSpoiler: !!isSpoiler,
    };
    const res = await http.post(`/reviews`, body, { headers: authHeader() });
    return res?.data?.data;
  },
};

export default reviewsApi;
