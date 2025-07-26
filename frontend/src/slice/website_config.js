import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosApi from "../conf/axios";

// Async thunk to fetch website configurations from backend
export const fetchWebsiteConfig = createAsyncThunk(
  'fetchWebsiteConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get('/website-configs');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch website configs");
    }
  }
);

export const fetchSuccessStories = createAsyncThunk(
  'fetchSuccessStories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get('/success-stories');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch success stories");
    }
  }
);

export const websiteConfigSlice = createSlice({
  name: 'website_config',
  initialState: {
    loading: false,
    website_configs: [],
    success_stories : [],
    isError: false,
    errorMessage: ''
  },
  reducers: {}, // Add sync reducers if needed in the future
  extraReducers: (builder) => {
    builder
      .addCase(fetchWebsiteConfig.pending, (state) => {
        state.loading = true;
        state.isError = false;
        state.errorMessage = '';
      })
      .addCase(fetchWebsiteConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.website_configs = action.payload;
      })
      .addCase(fetchWebsiteConfig.rejected, (state, action) => {
        state.loading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      .addCase(fetchSuccessStories.pending, (state) => {
        state.loading = true;
        state.isError = false;
        state.errorMessage = '';
      })
      .addCase(fetchSuccessStories.fulfilled, (state, action) => {
        state.loading = false;
        state.success_stories = action.payload;
      })
      .addCase(fetchSuccessStories.rejected, (state, action) => {
        state.loading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      });
  }
});

export default websiteConfigSlice.reducer;
