import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { searchProducts, clear } from "../../features/products/productSlice";
import type { Product } from "../../types";

type Props = {
  onSelect: (p: Product) => void;
};

export default function ProductSearch({ onSelect }: Props) {
  const [q, setQ] = useState("");
  const dispatch = useAppDispatch();
  const { results, loading, error } = useAppSelector((s) => s.products);

  const boxRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  // Debounced search
  useEffect(() => {
    if (!q) {
      dispatch(clear());
      return;
    }
    const id = setTimeout(() => dispatch(searchProducts(q)), 200);
    return () => clearTimeout(id);
  }, [q, dispatch]);

  // Click outside to close highlight
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setActive(-1);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    }
    if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      onSelect(results[active]);
      setQ("");
      dispatch(clear());
      setActive(-1);
    }
    if (e.key === "Escape") {
      setActive(-1);
      dispatch(clear());
    }
  }

  const shouldShowPanel = q.length > 0;

  return (
    <div className="relative pt-1" ref={boxRef}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search product…"
        className="w-full rounded-xl border p-2"
      />

      {shouldShowPanel && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border bg-white shadow">
          {loading && (
            <div className="p-2 text-sm text-gray-500">Searching…</div>
          )}
          {!loading && error && (
            <div className="p-2 text-sm text-red-600">{String(error)}</div>
          )}
          {!loading && !error && results.length === 0 && (
            <div className="p-2 text-sm text-gray-500">No results</div>
          )}
          {!loading && !error && results.length > 0 && (
            <ul className="max-h-72 w-full overflow-auto rounded-b-xl">
              {results.map((p, i) => (
                <li
                  key={p.id}
                  className={`flex cursor-pointer items-center gap-3 p-2 hover:bg-gray-50 ${
                    i === active ? "bg-gray-100" : ""
                  }`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    onSelect(p);
                    setQ("");
                    dispatch(clear());
                    setActive(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(p);
                      setQ("");
                      dispatch(clear());
                      setActive(-1);
                    }
                  }}
                >
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-10 w-10 rounded object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "data:image/svg+xml;utf8," +
                        encodeURIComponent(
                          `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'>
                             <rect width='100%' height='100%' fill='#eee'/>
                             <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#999' font-size='10'>IMG</text>
                           </svg>`
                        );
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      Stock: {p.stock}{" "}
                      {p.stock < 5 && (
                        <span className="text-red-600">(Low)</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    Rp {p.priceCents.toLocaleString("id-ID")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
