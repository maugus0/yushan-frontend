import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const categoriesService = {
  async getCategories() {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data.data.categories;
  },
};

export default categoriesService;
