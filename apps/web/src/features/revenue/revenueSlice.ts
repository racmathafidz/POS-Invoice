import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/axios';
import type { RevenuePoint } from '../../types';

export const fetchRevenue = createAsyncThunk<RevenuePoint[], { granularity: 'daily' | 'weekly' | 'monthly'; from?: string; to?: string }>(
  'revenue/fetch',
  async (params) => {
    const { data } = await api.get('/api/revenue', { params });
    return data;
  }
);

const revenueSlice = createSlice({
  name: 'revenue',
  initialState: { points: [] as RevenuePoint[], granularity: 'daily' as 'daily' | 'weekly' | 'monthly', autoScroll: true },
  reducers: {
    setGranularity: (s, a: PayloadAction<'daily' | 'weekly' | 'monthly'>) => { s.granularity = a.payload; },
    setAutoScroll: (s, a: PayloadAction<boolean>) => { s.autoScroll = a.payload; }
  },
  extraReducers: (b) => {
    b.addCase(fetchRevenue.fulfilled, (s, a) => { s.points = a.payload; });
  }
});

export const { setGranularity, setAutoScroll } = revenueSlice.actions;

export default revenueSlice.reducer;