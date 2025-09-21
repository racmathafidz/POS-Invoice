import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Product } from '../../types';
import { filterLocalProducts } from '../../mock/products';

export const searchProducts = createAsyncThunk<Product[], string>(
  'products/search',
  async (q) => {
    if (!q || q.trim().length < 1) return [];
    return filterLocalProducts(q);
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: { results: [] as Product[], loading: false, error: null as string | null },
  reducers: { clear: (s) => { s.results = []; s.error = null; } },
  extraReducers: (b) => {
    b.addCase(searchProducts.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(searchProducts.fulfilled, (s, a) => { s.loading = false; s.results = a.payload; });
    b.addCase(searchProducts.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed'; });
  }
});
export const { clear } = productsSlice.actions;
export default productsSlice.reducer;
