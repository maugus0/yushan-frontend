import axios from 'axios';
const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';
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
  async getLibraryNovels(filters) {
    const response = await axios.get(`${BASE}/library`, { headers: authHeader(), params: filters });
    return response.data;
  },
  async getNovelDetails(novelId) {
    const response = await axios.get(`${BASE}/library/${novelId}`, { headers: authHeader() });
    return response.data;
  },
  async deleteNovelFromLibrary(novelId) {
    const response = await axios.delete(`${BASE}/library/${novelId}`, { headers: authHeader() });
    return response.data;
  },
};

export default libraryApi;
