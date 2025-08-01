import api from './api';

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/hr/dashboard/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch dashboard stats');
  }
};

export const getEmployeeSummary = async () => {
  try {
    const response = await api.get('/hr/employees/summary');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch employee summary');
  }
};

export const searchEmployees = async (query) => {
  try {
    const response = await api.get(`/hr/employees/search?query=${query}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to search employees');
  }
};

export const getVisaStatusInProgress = async () => {
  try {
    const response = await api.get('/hr/visa-status/in-progress');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch visa status');
  }
};

export const getVisaStatusAll = async (search = '') => {
  try {
    const response = await api.get(`/hr/visa-status/all${search ? `?search=${search}` : ''}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch visa status');
  }
};

export const getEmployeeProfile = async (profileId) => {
  try {
    const response = await api.get(`/profiles/${profileId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch employee profile');
  }
};

export const reviewApplication = async (profileId, action, feedback) => {
  try {
    const response = await api.post(`/profiles/${profileId}/review`, { action, feedback });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to review application');
  }
};

export const getApplicationsByStatus = async (status) => {
  try {
    const response = await api.get(`/profiles/status/${status}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch applications');
  }
};

export const generateRegistrationToken = async (email) => {
  try {
    const response = await api.post('/auth/generate-token', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to generate token');
  }
};

export const getRegistrationTokens = async () => {
  try {
    const response = await api.get('/auth/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch tokens');
  }
};

export const reviewVisaDocument = async (documentId, action, feedback) => {
  try {
    const response = await api.post(`/documents/visa/${documentId}/review`, { action, feedback });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to review document');
  }
};

export const sendReminder = async (profileId, nextStep) => {
  try {
    const response = await api.post(`/documents/reminder/${profileId}`, { nextStep });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to send reminder');
  }
};