import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const fetchContents = createAsyncThunk(
    'fetchContents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get('/content/search?tags=1');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch contents");
    }
  }
);
export const fetchReels = createAsyncThunk(
  'fetchReels',
async (_, { rejectWithValue }) => {
  try {
    const response = await axiosApi.get('/content/search?tags=3');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch reels");
  }
}
);



export const contentSlice = createSlice({
   name : 'content',
   initialState : {
        loading : false,
        contents : [],
        reels: [],
        isError : false,
        errorMessage : ''
     },
     extraReducers : (builder) => {
        builder
        .addCase(fetchContents.pending, (state) => {
            state.loading = true;
            state.isError = false;
            state.errorMessage = '';
        })
        .addCase(fetchContents.fulfilled, (state, action) => {
            state.loading = false;
            state.contents = action.payload;
        })
        .addCase(fetchContents.rejected, (state, action) => {
            state.loading = false;
            state.isError = true;
            state.errorMessage = action.payload;
        })
        .addCase(fetchReels.pending, (state) => {
          state.loading = true;
          state.isError = false;
          state.errorMessage = '';
      })
      .addCase(fetchReels.fulfilled, (state, action) => {
          state.loading = false;
          state.reels = action.payload;
      })
      .addCase(fetchReels.rejected, (state, action) => {
          state.loading = false;
          state.isError = true;
          state.errorMessage = action.payload;
      })
    }
});
export default contentSlice.reducer;