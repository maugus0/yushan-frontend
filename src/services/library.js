import axios from 'axios';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const libraryService = {
  async getLibraryNovels() {
    const response = await axios.get(`/library`);
    return response.data;
  },
  async getNovelDetails(novelId) {
    const response = await axios.get(`/library/${novelId}`);
    return response.data;
  },
  async deleteNovelFromLibrary(novelId) {
    const response = await axios.delete(`/library/${novelId}`);
    return response.data;
  }
};

export default libraryService;