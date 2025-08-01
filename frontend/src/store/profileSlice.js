import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as profileService from '../services/profile';

// Async thunks
export const fetchMyProfile = createAsyncThunk(
  'profile/fetchMyProfile',
  async () => {
    const response = await profileService.getMyProfile();
    return response;
  }
);

export const submitOnboarding = createAsyncThunk(
  'profile/submitOnboarding',
  async (formData) => {
    const response = await profileService.submitOnboarding(formData);
    return response;
  }
);

export const updatePersonalInfo = createAsyncThunk(
  'profile/updatePersonalInfo',
  async ({ section, data }) => {
    const response = await profileService.updatePersonalInfo(section, data);
    return response;
  }
);

const initialState = {
  profile: null,
  documents: null,
  status: 'Never Submitted',
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.updateError = null;
    },
    setProfileStatus: (state, action) => {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.userProfile;
        state.documents = action.payload.documents;
        state.status = action.payload.status;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Submit Onboarding
      .addCase(submitOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.status = action.payload.status;
      })
      .addCase(submitOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update Personal Info
      .addCase(updatePersonalInfo.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updatePersonalInfo.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.profile = action.payload.userProfile;
      })
      .addCase(updatePersonalInfo.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.error.message;
      });
  },
});

export const { clearError, setProfileStatus } = profileSlice.actions;
export default profileSlice.reducer;