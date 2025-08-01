import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosApi from "../conf/axios";

export const fetchAllEvents = createAsyncThunk('fetchAllEvents', async (headers, { rejectWithValue }) => {
    try {
        const response = await axiosApi.get('/events/artist-events', {
            headers: headers
        });
        if (response.status === 200) {
            return response.data;
        }
    }
    catch (err) {
        console.log(err);
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch events');
    }
});

export const changeSelectedEvent = createAsyncThunk('changeSelectedEvent', ({ data: data }) => {
    return data.event_id;
});

export const eventSlice = createSlice({
    name: 'event',
    initialState: {
        allEvents: [],
        loading: false,
        error: false,
        selectedEvent: null
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAllEvents.pending, (state) => {
            state.loading = true;
            state.error = false;
        })
        builder.addCase(fetchAllEvents.fulfilled, (state, action) => {
            state.loading = false;
            state.allEvents = action.payload;
        })
        builder.addCase(fetchAllEvents.rejected, (state) => {
            state.loading = false;
            state.error = true;
        })
        builder.addCase(changeSelectedEvent.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(changeSelectedEvent.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedEvent = action.payload;
        })
        builder.addCase(changeSelectedEvent.rejected, (state) => {
            state.loading = false;
            state.error = true;
        })
    }
});

export default eventSlice.reducer;