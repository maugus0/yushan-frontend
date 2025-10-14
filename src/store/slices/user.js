import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    updateYuan: (state, action) => {
      if (state.user) {
        state.user.yuan = action.payload;
      }
    },
  },
});

export const { login, logout, updateUser, setAuthenticated, updateYuan } = userSlice.actions;
export default userSlice.reducer;
