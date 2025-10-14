import { http, authHeader } from './_http';

const reportsApi = {
  async reportNovel(novelId, { reportType, reason }) {
    // Ensure the request body is correct
    const res = await http.post(
      `/reports/novel/${novelId}`,
      { reportType, reason },
      { headers: authHeader() }
    );
    return res?.data?.data;
  },
};
export default reportsApi;
