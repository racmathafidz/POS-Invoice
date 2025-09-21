import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/axios';
import type { InvoiceSummary } from '../../types';

export const fetchInvoices = createAsyncThunk<{ nodes: InvoiceSummary[]; nextCursor: string | null }, { cursor?: string | null; limit?: number }>(
  'invoices/fetch',
  async ({ cursor, limit = 10 }) => {
    const { data } = await api.get('/api/invoices', { params: { cursor, limit } });
    return data;
  }
);

export const createInvoice = createAsyncThunk<any, any>(
  'invoices/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/invoices', payload);
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data || { error: 'Failed' });
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: { list: [] as InvoiceSummary[], nextCursor: null as string | null, loading: false, error: null as string | null },
  reducers: {
    reset: (s) => { s.list = []; s.nextCursor = null; s.error = null; }
  },
  extraReducers: (b) => {
    b.addCase(fetchInvoices.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchInvoices.fulfilled, (s, a) => {
      s.loading = false;
      s.list.push(...a.payload.nodes);
      s.nextCursor = a.payload.nextCursor;
    });
    b.addCase(fetchInvoices.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed'; });
  }
});

export const { reset } = invoiceSlice.actions;

export default invoiceSlice.reducer;