import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const reviewService = {
  async getReviews(filters) {
    const response = await axios.get(`${API_URL}/reviews`, {
      params: filters,
    });
    return response.data.data.content;
  },
};

export default reviewService;
