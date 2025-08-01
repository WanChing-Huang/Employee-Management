import api from './api';

export const uploadDocument = async (file, type) => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to upload document');
  }
};

export const getMyDocuments = async () => {
  try {
    const response = await api.get('/documents/my-documents');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch documents');
  }
};

export const downloadDocument = async (documentId) => {
  try {
    const response = await api.get(`/documents/download/${documentId}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to download document');
  }
};

export const getVisaStatus = async () => {
  try {
    const response = await api.get('/documents/visa-status');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch visa status');
  }
};

export const downloadTemplate = async (templateType) => {
  try {
    const response = await api.get(`/documents/template/${templateType}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to download template');
  }
};