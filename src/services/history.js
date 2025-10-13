import { http, authHeader } from './_http';

const historyApi = {
  async list({ page = 0, size = 20 } = {}) {
    const res = await http.get(`/history`, { params: { page, size }, headers: authHeader() });
    return res?.data?.data;
  },
  async lastForNovel(novelId) {
    // Backend has no filter; fetch first page and filter on FE
    const data = await this.list({ page: 0, size: 50 });
    const list = Array.isArray(data?.content) ? data.content : [];
    // sort by viewTime desc then pick first matching novelId
    list.sort((a, b) => new Date(b.viewTime || 0) - new Date(a.viewTime || 0));
    return list.find((it) => Number(it.novelId) === Number(novelId)) || null;
  },
};

export default historyApi;
