import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosApi from "../conf/axios";


export const fetchNewRelease = createAsyncThunk('fetchNewRelease', async (headers) => {
    try {
        const response = await axiosApi.get('/home/new-releases',{
            headers: headers
        });
        if (response.data.success) {
            return response.data;
        }
    }
    catch (err) {
        console.log(err);
    }
})
export const fetchLeaderboard = createAsyncThunk('fetchLeaderboard', async (headers) => {
    try {
        const response = await axiosApi.get('/leaderboard',{
            headers: headers
        });
        if (response.data.success) {
            return response.data.data;
        }
    }
    catch (err) {
        console.log(err);
    }
})



export const newRelease = createSlice({
    name: 'newRelease',
    initialState: {
        newRelease: [],
        loading: false,
        leaderboard: [],
        error: null
    },
    extraReducers: (builder) => {
        builder.addCase(fetchNewRelease.pending, (state, action) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchNewRelease.fulfilled, (state, action) => {
            state.loading = false;
            state.newRelease = action.payload;
        });
        builder.addCase(fetchNewRelease.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        builder.addCase(fetchLeaderboard.pending, (state, action) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchLeaderboard.fulfilled, (state, action) => {
            state.loading = false;
            state.leaderboard = action.payload;
        });
        builder.addCase(fetchLeaderboard.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
})

export default newRelease.reducer