export type Product = { id: number; name: string; priceCents: number; stock: number; imageUrl: string };
export type InvoiceSummary = { id: number; date: string; customerName: string; salespersonName: string; notes?: string | null; totalCents: number };
export type RevenuePoint = { at: string; total: number };