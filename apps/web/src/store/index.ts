import { configureStore } from '@reduxjs/toolkit';
import products from '../features/products/productSlice';
import invoices from '../features/invoices/invoiceSlice';
import revenue from '../features/revenue/revenueSlice';

export const store = configureStore({ reducer: { products, invoices, revenue } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;