import { describe, it, expect } from 'vitest';
import reducer, { reset } from '../features/invoices/invoiceSlice';

describe('invoices slice', () => {
  it('reset should clear list and nextCursor', () => {
    const prev = { list:[{id:1,date:'2025-01-01',customerName:'A',salespersonName:'B',notes:null,totalCents:100}], nextCursor:'2', loading:false, error:null } as any;
    const next = reducer(prev, reset());
    expect(next.list).toEqual([]);
    expect(next.nextCursor).toBeNull();
  });
});