import { AdminPageHeader, PageCard } from "./admin-shell";
import { useEffect, useState } from "react";
import { ADMIN_API_BASE } from "@/lib/admin-api";
import { getAdminToken } from "@/lib/admin-session";

type DashboardStats = { totalSales: number; totalOrders: number; todayOrders: number; totalProducts: number; totalStock: number };

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [report, setReport] = useState<{ period: string; sales: number; orders: number }[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${ADMIN_API_BASE}/api/dashboard/summary`, { headers: { Authorization: `Bearer ${getAdminToken()}` } })
      .then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload?.message || "Unable to load dashboard stats."); return payload; })
      .then((payload) => { if (active) setStats(payload.data); })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard stats."); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setReportLoading(true);
    fetch(`${ADMIN_API_BASE}/api/dashboard/report?period=${period}`, { headers: { Authorization: `Bearer ${getAdminToken()}` } })
      .then((response) => response.json())
      .then((payload) => { if (active) setReport(Array.isArray(payload?.data?.rows) ? payload.data.rows : []); })
      .catch(() => { if (active) setReport([]); })
      .finally(() => { if (active) setReportLoading(false); });
    return () => { active = false; };
  }, [period]);

  function downloadReport() {
    const csv = [["Period", "Sales", "Orders"], ...report.map((row) => [row.period, String(row.sales), String(row.orders)])].map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `lgs-sales-${period}-report.csv`; link.click(); URL.revokeObjectURL(url);
  }

  const cards = [
    ["Total sales", stats ? `₹${stats.totalSales.toLocaleString("en-IN")}` : "—", "All non-cancelled orders"],
    ["Total orders", stats?.totalOrders ?? "—", "Orders received"],
    ["Today’s orders", stats?.todayOrders ?? "—", "Orders created today"],
    ["Products", stats?.totalProducts ?? "—", `${stats?.totalStock ?? "—"} units in stock`],
  ];
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#eadfd3] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7f1d1d]">
              Lucky Varieties Beauty Mall
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Admin workspace
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500">
              Manage products, categories, blogs and orders from one place.
            </p>
          </div>
        </div>
      </section>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, note]) => (
          <PageCard key={label}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#7f1d1d]">{value}</p>
            <p className="mt-2 text-xs text-stone-500">{note}</p>
          </PageCard>
        ))}
      </div>
      <PageCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="text-lg font-semibold">Sales report</h3><p className="mt-1 text-sm text-stone-500">Live sales and order trends from the database.</p></div>
          <div className="flex gap-2"><select value={period} onChange={(event) => setPeriod(event.target.value as typeof period)} className="h-10 rounded-lg border px-3 text-sm"><option value="week">Weekly</option><option value="month">Monthly</option><option value="year">Yearly</option></select><button type="button" onClick={downloadReport} disabled={!report.length} className="rounded-lg bg-[#7f1d1d] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Download CSV</button></div>
        </div>
        {reportLoading ? <p className="mt-8 text-sm text-stone-500">Loading report...</p> : report.length === 0 ? <p className="mt-8 text-sm text-stone-500">No sales data for this period.</p> : <div className="mt-8 flex h-64 items-end gap-2 overflow-x-auto border-b border-l border-stone-200 px-3 pb-0">{report.map((row) => { const max = Math.max(...report.map((item) => item.sales), 1); const height = Math.max((row.sales / max) * 100, 4); return <div key={row.period} className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] text-stone-500">₹{row.sales.toLocaleString("en-IN")}</span><div title={`${row.period}: ₹${row.sales} (${row.orders} orders)`} className="w-full max-w-14 rounded-t-md bg-[#a32929] transition-all" style={{ height: `${height}%` }} /><span className="text-[10px] text-stone-500">{row.period}</span></div>; })}</div>}
      </PageCard>
    </div>
  );
}

export function SectionStub({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <AdminPageHeader title={title} sub={subtitle} />
      <PageCard>
        <div className="grid min-h-60 place-items-center text-center">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-stone-500">This section is ready to be connected to the backend.</p>
          </div>
        </div>
      </PageCard>
    </div>
  );
}
