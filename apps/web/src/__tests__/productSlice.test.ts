import { describe, it, expect } from 'vitest';
import reducer, { clear } from '../features/products/productSlice';

describe('products slice', () => {
  it('should handle initial state', () => {
    const state = reducer(undefined as any, { type: '@@INIT' });
    expect(state.results).toEqual([]);
    expect(state.loading).toBe(false);
  });
  it('should clear results', () => {
    const prev = { results: [{ id:1,name:'x',priceCents:1,stock:1,imageUrl:'' }], loading:false, error:null } as any;
    const next = reducer(prev, clear());
    expect(next.results).toEqual([]);
  });
});