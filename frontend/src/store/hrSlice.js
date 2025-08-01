import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as hrService from '../services/hr';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'hr/fetchDashboardStats',
  async () => {
    const response = await hrService.getDashboardStats();
    return response;
  }
);

export const fetchEmployeeSummary = createAsyncThunk(
  'hr/fetchEmployeeSummary',
  async () => {
    const response = await hrService.getEmployeeSummary();
    return response;
  }
);

export const searchEmployees = createAsyncThunk(
  'hr/searchEmployees',
  async (query) => {
    const response = await hrService.searchEmployees(query);
    return response;
  }
);

export const fetchVisaStatusInProgress = createAsyncThunk(
  'hr/fetchVisaStatusInProgress',
  async () => {
    const response = await hrService.getVisaStatusInProgress();
    return response;
  }
);

export const fetchVisaStatusAll = createAsyncThunk(
  'hr/fetchVisaStatusAll',
  async (search) => {
    const response = await hrService.getVisaStatusAll(search);
    return response;
  }
);

export const fetchEmployeeProfile = createAsyncThunk(
  'hr/fetchEmployeeProfile',
  async (profileId) => {
    const response = await hrService.getEmployeeProfile(profileId);
    return response;
  }
);

export const reviewApplication = createAsyncThunk(
  'hr/reviewApplication',
  async ({ profileId, action, feedback }) => {
    const response = await hrService.reviewApplication(profileId, action, feedback);
    return response;
  }
);

export const fetchApplicationsByStatus = createAsyncThunk(
  'hr/fetchApplicationsByStatus',
  async (status) => {
    const response = await hrService.getApplicationsByStatus(status);
    return response;
  }
);

export const generateRegistrationToken = createAsyncThunk(
  'hr/generateRegistrationToken',
  async (email) => {
    const response = await hrService.generateRegistrationToken(email);
    return response;
  }
);

export const fetchRegistrationTokens = createAsyncThunk(
  'hr/fetchRegistrationTokens',
  async () => {
    const response = await hrService.getRegistrationTokens();
    return response;
  }
);

export const reviewVisaDocument = createAsyncThunk(
  'hr/reviewVisaDocument',
  async ({ documentId, action, feedback }) => {
    const response = await hrService.reviewVisaDocument(documentId, action, feedback);
    return response;
  }
);

export const sendReminder = createAsyncThunk(
  'hr/sendReminder',
  async ({ profileId, nextStep }) => {
    const response = await hrService.sendReminder(profileId, nextStep);
    return response;
  }
);

export const fetchDocumentsByProfile = createAsyncThunk(
  'hr/fetchDocumentsByProfile',
  async (profileId) => {
    const res = await hrService.getDocumentsByProfileId(profileId);
    return { profileId, documents: res };
  }
);

const initialState = {
  dashboardStats: null,
  employees: [],
  searchResults: [],
  visaInProgress: [],
  visaAll: [],
  selectedEmployee: null,
  applications: {
    pending: [],
    approved: [],
    rejected: [],
  },
  registrationTokens: [],
  loading: false,
  error: null,
  documentsByEmployee: {},
};

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      })
      // Employee Summary
      .addCase(fetchEmployeeSummary.fulfilled, (state, action) => {
        state.employees = action.payload.employees;
      })
      // Search Employees
      .addCase(searchEmployees.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      // Visa Status In Progress
      .addCase(fetchVisaStatusInProgress.fulfilled, (state, action) => {
        state.visaInProgress = action.payload;
      })
      // Visa Status All
      .addCase(fetchVisaStatusAll.fulfilled, (state, action) => {
        state.visaAll = action.payload;
      })
      // Employee Profile
      .addCase(fetchEmployeeProfile.fulfilled, (state, action) => {
        state.selectedEmployee = action.payload;
      })
      // Applications by Status
      .addCase(fetchApplicationsByStatus.fulfilled, (state, action) => {
        const status = action.meta.arg.toLowerCase();
        state.applications[status] = action.payload;
      })
      // Registration Tokens
      .addCase(fetchRegistrationTokens.fulfilled, (state, action) => {
        state.registrationTokens = action.payload.data;
      })
      .addCase(fetchDocumentsByProfile.fulfilled, (state, action) => {
  const { profileId, documents } = action.payload;
  state.documentsByEmployee[profileId] = documents;
})
      // Generic loading states
      .addMatcher(
                             // Matches any action that starts with 'hr/' and ends with '/pending'
        (action) => action.type.startsWith('hr/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('hr/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('hr/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        }
      );
  },
});

export const { clearError, clearSearchResults } = hrSlice.actions;
export default hrSlice.reducer;