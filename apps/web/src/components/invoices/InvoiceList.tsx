import { useEffect, useRef, useState } from "react";
import { fetchInvoices, reset } from "../../features/invoices/invoiceSlice";
import { useAppDispatch } from "../../store/hooks";
import InvoiceCard from "./InvoiceCard";
import type { InvoiceSummary } from "../../types";

const PAGE_SIZE = 5;

export default function InvoiceList() {
  const dispatch = useAppDispatch();

  const [pages, setPages] = useState<InvoiceSummary[][]>([]);
  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const didInit = useRef(false);

  async function fetchPage(cursor?: string | null) {
    setLoading(true);
    const action = await dispatch(fetchInvoices({ cursor, limit: PAGE_SIZE }));
    setLoading(false);

    if (action.meta.requestStatus === "fulfilled") {
      const { nodes, nextCursor } = action.payload as {
        nodes: InvoiceSummary[];
        nextCursor: string | null;
      };

      setPages((prev) => {
        const nextPages = [...prev, nodes];
        setPageIndex(nextPages.length - 1);
        return nextPages;
      });
      setNextCursor(nextCursor);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    dispatch(reset());
    setPages([]);
    setPageIndex(0);
    setNextCursor(null);
    void fetchPage(null);
  }, [dispatch]);

  const hasNextPageInMemory = pages[pageIndex + 1] !== undefined;
  const currentPage = pages[pageIndex] ?? [];

  const canPrev = pageIndex > 0;
  const canNext =
    hasNextPageInMemory || (!!nextCursor && currentPage.length === PAGE_SIZE);

  const handlePrev = () => {
    if (!canPrev || loading) return;
    setPageIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = async () => {
    if (!canNext || loading) return;

    if (hasNextPageInMemory) {
      setPageIndex((i) => i + 1);
      return;
    }
    if (nextCursor) {
      await fetchPage(nextCursor);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {currentPage.map((inv) => (
          <InvoiceCard key={inv.id} inv={inv} />
        ))}
        {!loading && currentPage.length === 0 && (
          <div className="rounded-xl border p-4 text-sm text-gray-500">
            No invoices to display.
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="rounded-xl border px-3 py-1 disabled:opacity-50"
          onClick={handlePrev}
          disabled={!canPrev || loading}
        >
          Prev
        </button>

        <div className="text-sm">
          Page <span className="font-semibold">{pageIndex + 1}</span>
        </div>

        <button
          type="button"
          className="rounded-xl border px-3 py-1 disabled:opacity-50"
          onClick={handleNext}
          disabled={!canNext || loading}
        >
          {loading && !hasNextPageInMemory ? "Loading…" : "Next"}
        </button>
      </div>
    </div>
  );
}
