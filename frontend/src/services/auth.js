import api from './api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

export const validateToken = async (token) => {
  try {
    const response = await api.get(`/auth/validate-token/${token}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Invalid token');
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Even if logout fails on server, clear local data
    console.error('Logout error:', error);
  }
};