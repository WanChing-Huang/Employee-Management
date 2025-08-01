import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import hrReducer from './hrSlice';
import documentReducer from './documentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    hr: hrReducer,
    document: documentReducer,
  },
});

