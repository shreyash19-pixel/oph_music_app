import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosApi from "../conf/axios";



export const fetchEvents = createAsyncThunk(
    "fetchEvents",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosApi.get("/events/events");
            return response.data;
            } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch events");
        }
    }
);


export const eventSlice = createSlice({
    name: "event",
    initialState: {
        upcomingEvents: [],
        previousEvents : [],
        allEvents: {},
        loading: false,
        isError: false,
        errorMessage: "",
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchEvents.pending, (state) => {
            state.loading = true;
            state.isError = false;
            state.errorMessage = "";
        }
        )
        .addCase(fetchEvents.fulfilled, (state, action) => {
            state.loading = false;
            state.upcomingEvents = action.payload.upcoming_events;
            state.previousEvents = action.payload.previous_events;
            state.allEvents = action.payload;
        })
        .addCase(fetchEvents.rejected, (state, action) => {
            state.loading = false;
            state.isError = true;
            state.errorMessage = action.payload;
        });
    }
    });

export default eventSlice.reducer;