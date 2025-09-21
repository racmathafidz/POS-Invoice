import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import zoomPlugin from "chartjs-plugin-zoom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchRevenue,
  setGranularity,
  setAutoScroll,
} from "../../features/revenue/revenueSlice";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  zoomPlugin
);

const WINDOW_SIZE = { daily: 30, weekly: 26, monthly: 12 } as const;

/* Helpers to normalize buckets */
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeekMon(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7; // shift so Monday is 0
  x.setDate(x.getDate() - diff);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function addWeeks(d: Date, n: number) {
  return addDays(d, n * 7);
}
function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function buildWindow(
  granularity: "daily" | "weekly" | "monthly",
  latest: Date
) {
  const win = WINDOW_SIZE[granularity];
  let end: Date;
  if (granularity === "daily") end = startOfDay(latest);
  else if (granularity === "weekly") end = startOfWeekMon(latest);
  else end = startOfMonth(latest);

  const arr: number[] = new Array(win);
  for (let i = win - 1; i >= 0; i--) {
    let t: Date;
    if (granularity === "daily") t = addDays(end, -(win - 1 - i));
    else if (granularity === "weekly") t = addWeeks(end, -(win - 1 - i));
    else t = addMonths(end, -(win - 1 - i));
    arr[i] = t.getTime();
  }
  return arr;
}

export default function RevenueChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const dispatch = useAppDispatch();
  const { points, granularity, autoScroll } = useAppSelector((s) => s.revenue);

  //
  useEffect(() => {
    dispatch(fetchRevenue({ granularity }));
  }, [granularity, dispatch]);

  useEffect(() => {
    const ctx = canvasRef.current!.getContext("2d")!;

    const latest = points.length
      ? new Date(points[points.length - 1].at)
      : new Date();

    const agg = new Map<number, number>();
    for (const p of points) {
      const d = new Date(p.at);
      let b: Date;
      if (granularity === "daily") b = startOfDay(d);
      else if (granularity === "weekly") b = startOfWeekMon(d);
      else b = startOfMonth(d);

      const key = b.getTime();
      agg.set(key, (agg.get(key) ?? 0) + p.total);
    }

    const windowBuckets = buildWindow(granularity, latest);
    const data = windowBuckets.map((ts) => ({
      x: ts,
      y: agg.get(ts) ?? 0,
    }));

    chartRef.current?.destroy();
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Revenue",
            data,
            borderWidth: 2,
            tension: 0.1,
            pointRadius: 2,
            showLine: true,
            spanGaps: true,
          },
        ],
      },
      options: {
        parsing: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { type: "time" },
          y: { beginAtZero: true },
        },
        plugins: {
          legend: { display: false },
          tooltip: { intersect: false, mode: "index" as const },
          zoom: {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: "x",
            },
            pan: { enabled: true, mode: "x" },
          },
        },
      },
    });

    if (autoScroll && data.length > 0) {
      const first = data[0].x as number;
      const last = data[data.length - 1].x as number;
      const c = chartRef.current!;

      c.options.scales!.x!.min = first;
      c.options.scales!.x!.max = last;
      c.update("none");
    }
  }, [points, granularity, autoScroll]);

  const toggleAutoScroll = () => dispatch(setAutoScroll(!autoScroll));
  const resetZoom = () => {
    const c = chartRef.current;
    if (!c) return;
    if (c.options.scales?.x) {
      c.options.scales.x.min = undefined;

      c.options.scales.x.max = undefined;
    }

    c.resetZoom();
    c.update();
  };

  return (
    <div className="h-80 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={granularity}
          onChange={(e) => dispatch(setGranularity(e.target.value as any))}
          className="rounded-xl border p-2"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <button
          type="button"
          className="rounded-xl border px-3 py-1"
          onClick={resetZoom}
          title="Reset pan/zoom"
        >
          Reset Zoom
        </button>

        <label className="ml-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={toggleAutoScroll}
          />
          Auto-scroll to latest
        </label>
      </div>

      <canvas ref={canvasRef} />
    </div>
  );
}
