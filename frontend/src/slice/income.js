import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosApi from "../conf/axios";

export const fetchIncome = createAsyncThunk(
    'fetchIncome',
    async (headers, { rejectWithValue }) => {
        try {
            const response = await axiosApi.get('/income/details', {
                headers: headers
            });

            if (response.status === 200) {
                return response.data.data;
            } else {
                return rejectWithValue('Failed to fetch incomes');
            }
        } catch (err) {
            console.error("Error fetching incomes ", err);
            return rejectWithValue(err.response?.data?.message || "Something went wrong");
        }
    }
);

export const getWithDrawHistory = createAsyncThunk('getWithDrawHistory', async (ophID,headers, { rejectWithValue }) => {
    try {
        const response = await axiosApi.get('http://localhost:5000/getWithdraw', {
            headers: headers,
            ophID : ophID
        });
        if (response.status === 201) {
            return response.data.data;
;
        }
        return rejectWithValue('Failed to fetch withdrawal history');
    }
    catch (err) {
        console.log(err);
        return rejectWithValue(err.response?.data?.message || "Something went wrong");
    }
});

export const postWithdraw = createAsyncThunk('postWithdraw', async ({ data, headers }, { rejectWithValue }) => {
    try {
        const response = await axiosApi.post(
          "/sendWithdraw",
          data,
          {
            headers: headers,
          }
        );
        if (response.status === 201) {
            return response.data.data;
        }
        return rejectWithValue('Withdrawal failed');
    }
    catch (err) {
        console.log(err);
        return rejectWithValue(err.response?.data?.message || "Something went wrong");
    }
});

export const income = createSlice({
    name: 'income',
    initialState: {
        income: null,
        history:[],
        loading: false,
        isError: false,
        errorMessage: ''
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchIncome.pending, (state) => {
                state.loading = true;
                state.isError = false;
                state.errorMessage = '';
            })
            .addCase(fetchIncome.fulfilled, (state, action) => {
                state.loading = false;
                state.income = action.payload;  // Fixed from `state.data` to `state.dates`
            })
            .addCase(fetchIncome.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.errorMessage = action.payload || 'Failed to fetch data';
            })
            .addCase(getWithDrawHistory.pending, (state) => {
                state.loading = true;
                state.isError = false;
                state.errorMessage = '';
            })
            .addCase(getWithDrawHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            })
            .addCase(getWithDrawHistory.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.errorMessage = action.payload || 'Failed to fetch data';
            });
    }
});

export default income.reducer;
