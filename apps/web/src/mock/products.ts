import type { Product } from '../types';

const SEED_PRODUCTS: Product[] = [
  { id: 1, name: 'Arabica Beans 250g', priceCents: 89000, stock: 42, imageUrl: '/img/arabica.jpg' },
  { id: 2, name: 'Robusta Beans 250g', priceCents: 69000, stock: 55, imageUrl: '/img/robusta.jpg' },
  { id: 3, name: 'Whole Milk 1L',      priceCents: 24000, stock: 80, imageUrl: '/img/milk.jpg' },
  { id: 4, name: 'Chocolate Syrup',     priceCents: 35000, stock: 30, imageUrl: '/img/syrup.jpg' },
  { id: 5, name: 'Paper Cup (50x)',     priceCents: 28000, stock: 120, imageUrl: '/img/cups.jpg' }
];

export function filterLocalProducts(q: string): Product[] {
  const s = q.toLowerCase();
  return SEED_PRODUCTS.filter(p => p.name.toLowerCase().includes(s)).slice(0, 10);
}
