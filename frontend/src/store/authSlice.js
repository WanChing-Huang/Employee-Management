import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../services/auth';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }) => {
    const response = await authService.login(email, password);
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData) => {
    const response = await authService.register(userData);
    return response;
  }
);

export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (token) => {
    const response = await authService.validateToken(token);
    return response;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  profileStatus: null,
  redirectTo: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRedirectTo: (state, action) => {
      state.redirectTo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.profileStatus = action.payload.profileStatus;
        state.redirectTo = action.payload.redirectTo;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Validate Token
      .addCase(validateToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateToken.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.profileStatus = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  },
});

export const { clearError, setRedirectTo } = authSlice.actions;
export default authSlice.reducer;