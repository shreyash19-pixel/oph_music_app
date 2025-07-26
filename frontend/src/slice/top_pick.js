import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosApi from "../conf/axios";



export const fetchTopPicks = createAsyncThunk('fetchTopPicks', async (_, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get('/leaderboard/top-artists');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch top artists");
    }
  })


export const topPickSlice = createSlice({
    name: 'top_pick',
    initialState: {
        topPicks: [],
        loading: false,
        isError: false,
        errorMessage: ''
    },
    extraReducers: (builder) => {
        builder.addCase(
            fetchTopPicks.pending, (state) => {
                state.loading = true;
            }
        )
            .addCase(fetchTopPicks.fulfilled, (state, action) => {
                state.loading = false;
                state.topPicks = action.payload;
                state.isError = false;
            })
            .addCase(fetchTopPicks.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.errorMessage = action.payload;
            })
    }
})

export default topPickSlice.reducer