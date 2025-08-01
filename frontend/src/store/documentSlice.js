import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as documentService from '../services/document';

// Async thunks
export const uploadDocument = createAsyncThunk(
  'document/upload',
  async ({ file, type }) => {
    const response = await documentService.uploadDocument(file, type);
    return response;
  }
);

export const fetchMyDocuments = createAsyncThunk(
  'document/fetchMyDocuments',
  async () => {
    const response = await documentService.getMyDocuments();
    return response;
  }
);

export const fetchVisaStatus = createAsyncThunk(
  'document/fetchVisaStatus',
  async () => {
    const response = await documentService.getVisaStatus();
    return response;
  }
);

const initialState = {
  documents: null,
  profilePicture: null,
  visaStatus: null,
  uploadLoading: false,
  uploadError: null,
  loading: false,
  error: null,
};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.uploadError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Document
      .addCase(uploadDocument.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.documents = action.payload.documents;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.error.message;
      })
      // Fetch Documents
      .addCase(fetchMyDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload.documents;
        state.profilePicture = action.payload.profilePicture;
      })
      .addCase(fetchMyDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Visa Status
      .addCase(fetchVisaStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisaStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.visaStatus = action.payload.data;
      })
      .addCase(fetchVisaStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = documentSlice.actions;
export default documentSlice.reducer;