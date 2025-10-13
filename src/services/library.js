import { http, authHeader } from './_http';

const libraryApi = {
  async add(novelId, progress = 1) {
    const res = await http.post(`/library/${novelId}`, { progress }, { headers: authHeader() });
    return res?.data?.data;
  },
  async remove(novelId) {
    const res = await http.delete(`/library/${novelId}`, { headers: authHeader() });
    return res?.data?.data;
  },
  async check(novelId) {
    const res = await http.get(`/library/check/${novelId}`, { headers: authHeader() });
    return res?.data?.data === true;
  },
};

export default libraryApi;
