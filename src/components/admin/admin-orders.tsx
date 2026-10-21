import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, PageCard } from "./admin-shell";
import { ADMIN_API_BASE } from "@/lib/admin-api";
import { getAdminToken } from "@/lib/admin-session";
import { paymentLabel, readableAddress, type CustomerOrder } from "@/lib/customer-api";
import { OrderContents, OrderTimeline } from "../customer-order";
import { formatINR } from "@/data/site";

const transitions: Record<string, string[]> = { Pending: ["Confirmed", "Cancelled"], Confirmed: ["Processing", "Cancelled"], Processing: ["Shipped", "Ready for pickup", "Cancelled"], Shipped: ["Out for delivery", "Delivered"], "Out for delivery": ["Delivered"], "Ready for pickup": ["Delivered"] };
export function AdminOrdersPage() {
  const [page, setPage] = useState(1), [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CustomerOrder | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const headers = () => ({ Authorization: `Bearer ${getAdminToken()}`, "Content-Type": "application/json" });
  const query = useQuery({ queryKey: ["admin-orders", page, search], queryFn: async () => {
    const response = await fetch(`${ADMIN_API_BASE}/api/orders?page=${page}&q=${encodeURIComponent(search)}`, { headers: headers() }); const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Unable to load orders.");
    return result as { data: CustomerOrder[]; pagination: { totalPages: number }; notifications: { configured: boolean } };
  }, refetchInterval: selected ? false : 15000 });
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected || busy) return;
    const body = Object.fromEntries(new FormData(event.currentTarget));
    if (body["orderStatus"] === "Cancelled" && selected.orderStatus !== "Cancelled" && !window.confirm("Cancel this order and return its reserved stock?")) return;
    setBusy(true); setError("");
    try { const response = await fetch(`${ADMIN_API_BASE}/api/orders/${selected.id}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) }); const result = await response.json(); if (!response.ok) throw new Error(result.message); setSelected(result.data); await query.refetch(); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to update order."); } finally { setBusy(false); }
  }
  return <div className="space-y-6"><AdminPageHeader title="Orders" sub="Manage customer orders, payment collection and parcel tracking." />
    <PageCard><p className="text-sm">{query.data?.notifications.configured ? "Order emails are enabled. Sent means accepted by the email provider." : "Order emails are queued. Resend credentials and verified sending domain are required before sending."}</p></PageCard>
    <div className="flex gap-3"><input aria-label="Search orders" placeholder="Search order, customer, email or phone" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="h-11 min-w-0 flex-1 rounded border px-3" /><button className="rounded border px-4" onClick={() => query.refetch()}>Refresh</button></div>
    {query.isError && <p role="alert">{query.error.message}</p>}
    <PageCard><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Order", "Customer", "Total", "Order status", "Payment", "Actions"].map(title => <th key={title} className="whitespace-nowrap border-b p-3">{title}</th>)}</tr></thead><tbody>{query.data?.data.map(order => <tr key={order.id}><td className="whitespace-nowrap border-b p-3">{order.orderNumber}<div className="mt-1 text-xs">{new Date(order.createdAt).toLocaleDateString("en-IN")}</div></td><td className="border-b p-3">{order.customerName}<div className="whitespace-nowrap text-xs">{order.phone}</div></td><td className="whitespace-nowrap border-b p-3">{formatINR(Number(order.totalAmount))}</td><td className="border-b p-3">{order.orderStatus}</td><td className="border-b p-3">{paymentLabel(order.paymentMethod)}<div className="mt-1 font-semibold">{order.paymentStatus}</div></td><td className="border-b p-3"><button onClick={() => { setSelected(order); setError(""); }} className="whitespace-nowrap rounded border border-red-200 bg-red-50 px-4 py-2 text-red-900">Manage order</button></td></tr>)}</tbody></table>{query.isPending && <p className="p-5">Loading orders...</p>}{query.data?.data.length === 0 && <p className="p-5">No orders found.</p>}</div></PageCard>
    <div className="flex items-center justify-center gap-4"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border p-3 disabled:opacity-40">Previous</button><span>{page} / {query.data?.pagination.totalPages || 1}</span><button disabled={page >= (query.data?.pagination.totalPages || 1)} onClick={() => setPage(page + 1)} className="rounded border p-3 disabled:opacity-40">Next</button></div>
    {selected && <section className="space-y-6 rounded-xl border bg-white p-5 sm:p-7"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-2xl">{selected.orderNumber}</h2><button onClick={() => setSelected(null)} className="rounded border px-4 py-2">Close</button></div><p className="break-words text-sm leading-7">{selected.customerName} · {selected.email}<br />{selected.phone}<br />{readableAddress(selected.shippingAddress)}</p>
      <form key={selected.updatedAt} onSubmit={save} className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm">Order status<select name="orderStatus" defaultValue={selected.orderStatus} className="h-11 rounded border px-3">{[selected.orderStatus, ...(transitions[selected.orderStatus] || []).filter(status => selected.deliveryMode === "Pickup" ? !["Shipped", "Out for delivery"].includes(status) : status !== "Ready for pickup")].map(status => <option key={status}>{status}</option>)}</select></label>
      {selected.paymentMethod === "upi" ? <p className="text-sm leading-7">Online payment: <b>{selected.paymentStatus}</b><br />Verified by Razorpay. Admin cannot mark online payments paid.</p> : <label className="grid gap-2 text-sm">Payment collection<select name="paymentStatus" defaultValue={selected.paymentStatus} className="h-11 rounded border px-3">{[...new Set([selected.paymentStatus, ...(selected.paymentStatus === "Paid" ? ["Refunded"] : selected.paymentStatus === "Refunded" ? [] : ["Paid"])])].map(status => <option key={status} value={status}>{status === "Paid" ? "Paid — money received" : status}</option>)}</select></label>}
      {[['courierName', 'Courier name'], ['trackingNumber', 'Tracking / AWB number'], ['trackingUrl', 'Courier tracking URL']].map(([name, title]) => <label key={name} className="grid gap-2 text-sm">{title}<input name={name} type={name === 'trackingUrl' ? 'url' : 'text'} defaultValue={String(selected[name as keyof CustomerOrder] || '')} className="h-11 min-w-0 rounded border px-3" /></label>)}<p className="text-xs leading-6 sm:col-span-2">For COD, mark Paid only after money is collected. Delivered requires payment collection. Shipped requires courier and AWB details.</p>{error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}<button disabled={busy} className="min-h-11 rounded bg-red-900 px-5 text-white disabled:opacity-50">{busy ? "Saving..." : "Save order update"}</button></form>
      <div className="grid items-start gap-8 lg:grid-cols-2"><OrderContents order={selected} /><OrderTimeline order={selected} /></div><div className="border-t pt-5"><h3 className="mb-3 font-semibold">Email notifications</h3>{selected.emails?.map(email => <p key={email.id} className="mb-2 text-xs leading-6">Update #{email.eventId}: {email.status === "Sent" ? "Accepted by Resend" : email.status} · Attempts: {email.attempts}{email.lastError ? ` · ${email.lastError}` : ""}</p>)}</div>
    </section>}
  </div>;
}
