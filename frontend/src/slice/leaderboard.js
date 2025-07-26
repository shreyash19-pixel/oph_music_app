import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosApi from "../conf/axios";


export const fetchHistoryLeaderboard = createAsyncThunk('fetchHistoryLeaderboard', async (_, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get('/leaderboard/history');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch leaderboard");
    }
  })


export const leaderboardSlice = createSlice({
    name: 'leaderboard',
    initialState: {
        history_leaderboard: {},
        loading: false,
        isError: false,
        errorMessage: ''
    },
    extraReducers: (builder) => {
        builder.addCase(fetchHistoryLeaderboard.pending, (state) => {
            state.loading = true;
        })
            .addCase(fetchHistoryLeaderboard.fulfilled, (state, action) => {
                state.loading = false;
                state.history_leaderboard = action.payload;
                state.isError = false;
            })
            .addCase(fetchHistoryLeaderboard.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.errorMessage = action.error.message;
            })
    }
})
export default leaderboardSlice.reducer;