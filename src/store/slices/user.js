import { createSlice } from '@reduxjs/toolkit';

const userStore = createSlice({
  name: 'user',
  initialState: {},
  reducers: {},
});

const userReducer = userStore.reducer;

export default userReducer;
