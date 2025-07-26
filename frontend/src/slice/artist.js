import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosApi from "../conf/axios";


export const fetchArtists = createAsyncThunk('fetchArtists',
    async (_, { rejectWithValue }) => {
        try {
          const response = await axiosApi.get('/artists/search');
          return response.data.data;
        } catch (error) {
          return rejectWithValue(error.response?.data?.error || "Failed to fetch Artists");
        }
      }
)



export const artistSlice = createSlice({
    name: 'artist',
    initialState: {
        loading: false,
        artists: [],
        isError: false,
        errorMessage: ''
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchArtists.pending, (state, action) => {
                state.loading = true;
                state.isError = false;
                state.errorMessage = '';
            })
            .addCase(fetchArtists.fulfilled, (state, action) => {
                state.loading = false;
                state.artists = action.payload;
                state.isError = false;
                state.errorMessage = '';
            })
            .addCase(fetchArtists.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.errorMessage = action.error.message;
            })
    }
})

export default artistSlice.reducer