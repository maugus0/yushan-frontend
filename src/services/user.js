import axios from "axios";

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';


const userService = {
  async getMe() {
    const response = await axios.get(`/api/users/me`);
    return response.data.data;
  }
}

export default userService;