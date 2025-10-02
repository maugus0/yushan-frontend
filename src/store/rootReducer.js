import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/user';

const rootReducer = combineReducers({
  user: userReducer,
});

export default rootReducer;
