import type { InvoiceSummary } from "../../types";

export default function InvoiceCard({ inv }: { inv: InvoiceSummary }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{inv.customerName}</div>
        <div className="text-sm text-gray-500">
          {new Date(inv.date).toLocaleDateString()}
        </div>
      </div>
      <div className="text-sm">Sales: {inv.salespersonName}</div>
      {inv.notes && (
        <div className="text-sm text-gray-600">Notes: {inv.notes}</div>
      )}
      <div className="mt-2 font-bold">
        Rp {inv.totalCents.toLocaleString("id-ID")}
      </div>
    </div>
  );
}
