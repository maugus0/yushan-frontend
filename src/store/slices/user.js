import { createSlice } from '@reduxjs/toolkit';
import Testimg from '../../assets/images/testimg.png'; // Import the default avatar image

const initialState = {
  user: {
    uuid: '123e4567-e89b-12d3-a456-426614174000', // Mock UUID
    email: 'mockuser@example.com', // Mock email
    username: 'MockUser', // Mock username
    emailVerified: true, // Mock email verification status
    avatarUrl: Testimg, // Default avatar URL
    profileDetail: 'A passionate reader who loves fantasy and sci-fi.', // Mock profile detail
    birthday: '1990-01-01', // Mock birthday
    gender: 1, // Mock gender (1 = male)
    status: 1, // Mock status (e.g., active)
    isAuthor: true, // Mock author status
    authorVerified: true, // Mock author verification status
    level: 5, // Mock user level
    exp: 3200, // Mock experience points
    yuan: 500, // Mock virtual currency
    readTime: 128, // Mock total reading time
    readBookNum: 56, // Mock number of books read
    createDate: '2022-03-15', // Mock account creation date
    updateTime: '2023-10-01', // Mock last update time
    lastLogin: '2023-10-10T12:00:00Z', // Mock last login timestamp
    lastActive: '2023-10-10T12:30:00Z', // Mock last active timestamp
  },
  isAuthenticated: true, // Mock authentication status
};

// Uncomment this block for an empty initial state
/*
const initialState = {
  user: {
    uuid: null, // Unique identifier for the user
    email: null, // User's email address
    username: null, // User's username
    emailVerified: false, // Whether the email is verified
    avatarUrl: null, // Default avatar URL
    profileDetail: null, // Additional profile details
    birthday: null, // User's birthday
    gender: null, // Gender (e.g., 0 = unspecified, 1 = male, 2 = female)
    status: null, // User's status (e.g., active, banned, etc.)
    isAuthor: false, // Whether the user is an author
    authorVerified: false, // Whether the author is verified
    level: 1, // User's level
    exp: 0, // User's experience points
    yuan: 0, // User's currency (e.g., virtual currency)
    readTime: 0, // Total reading time
    readBookNum: 0, // Number of books read
    createDate: null, // Account creation date
    updateTime: null, // Last update time
    lastLogin: null, // Last login timestamp
    lastActive: null, // Last active timestamp
  },
  isAuthenticated: false, // Whether the user is authenticated
};
*/

const userStore = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.user = {
        ...state.user,
        ...action.payload, // Merge the payload into the user object
      };
      localStorage.setItem('authToken', action.payload.authToken); // Save auth token to localStorage
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = { ...initialState.user }; // Reset user to initial state
      localStorage.removeItem('authToken'); // Remove auth token from localStorage
    },
    updateUser(state, action) {
      Object.keys(action.payload).forEach((key) => {
        if (key in state.user) {
          state.user[key] = action.payload[key];
        }
      });
    },
  },
});

export const { login, logout, updateUser } = userStore.actions;
export default userStore.reducer;
