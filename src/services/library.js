import axios from 'axios';

const CONFIG_URL = (process.env.REACT_APP_API_URL || '').trim();
const BASE = CONFIG_URL ? CONFIG_URL.replace(/\/+$/, '') : '/api';
const authHeader = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const libraryService = {
  async getLibraryNovels(filters) {
    const response = await axios.get(
      `${BASE}/library`,
      { headers: authHeader(), params: filters }
    );
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

export default libraryService;
