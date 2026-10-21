import { useState } from "react";
import { payForOrder } from "@/lib/razorpay";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, Package, Truck } from "lucide-react";
import { PageHero } from "./commerce";
import { customerRequest, paymentLabel, readableAddress, useCustomer, type CustomerOrder } from "@/lib/customer-api";
import { formatINR } from "@/data/site";
import { resolveImageUrl } from "@/lib/admin-api";

export function OrderContents({ order }: { order: CustomerOrder }) {
  return <div className="space-y-5">{order.items?.map((item) => <div key={item.id} className="flex gap-4 border-b pb-4">
    {item.productImage && <img src={resolveImageUrl(item.productImage)} alt={item.productName} className="size-16 shrink-0 object-contain" />}
    <div className="min-w-0 flex-1"><p className="font-semibold">{item.productName}</p>{item.variantLabel && <p className="mt-1 text-xs text-muted-foreground">{item.variantLabel}</p>}<p className="mt-2 text-sm">{item.quantity} × {formatINR(Number(item.price))}</p></div><p className="text-sm font-semibold">{formatINR(Number(item.total))}</p>
  </div>)}<dl className="space-y-3 text-sm">{[["Subtotal", order.subtotal], ["Delivery", order.shippingCharge], ["Discount", -Number(order.discount)], ["Total", order.totalAmount]].map(([label, amount]) => <div key={String(label)} className="flex justify-between gap-4"><dt>{label}</dt><dd className="font-semibold">{formatINR(Number(amount))}</dd></div>)}</dl></div>;
}

export function OrderTimeline({ order }: { order: CustomerOrder }) {
  const events = [...(order.events || [])].sort((a, b) => a.id - b.id);
  return <ol className="space-y-5">{events.length ? events.map((event, index) => <li key={event.id} className="flex gap-3"><CheckCircle2 size={21} className={`mt-1 shrink-0 ${index === events.length - 1 ? "text-wine" : "text-emerald-700"}`} /><div><p className="font-semibold">{event.orderStatus}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{event.note}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString("en-IN")}</p></div></li>) : <li className="flex items-center gap-3"><Circle size={18} />{order.orderStatus}</li>}</ol>;
}

export function CustomerOrderPage({ orderNumber }: { orderNumber: string }) {
  const [paymentError, setPaymentError] = useState("");
  const [paying, setPaying] = useState(false);
  const options = useQuery({ queryKey: ["checkout-options"], queryFn: () => customerRequest<{ data: { onlinePaymentAvailable: boolean } }>("/api/customer/checkout-options") });
  const session = useCustomer();
  const user = session.data?.user;
  const result = useQuery({ queryKey: ["customer-order", user?.id, orderNumber], queryFn: () => customerRequest<{ data: CustomerOrder }>(`/api/customer/orders/${encodeURIComponent(orderNumber)}`), enabled: Boolean(user), refetchInterval: 10_000, retry: 1 });
  if (session.isPending || (user && result.isPending)) return <section className="container-lv py-16" role="status">Loading your order…</section>;
  if (!user) return <section className="container-lv py-16"><p>Sign in to view your order.</p><a href="/account" className="mt-5 inline-flex border border-wine px-5 py-3 text-wine">Sign in</a></section>;
  if (result.isError || !result.data) return <section className="container-lv py-16"><p role="alert">This order could not be found in your account.</p><a href="/account" className="mt-4 inline-flex text-wine">Back to my orders</a></section>;
  const order = result.data.data;
  return <>
    <PageHero title="Track Your Order" copy={order.orderNumber} />
    <section className="container-lv space-y-6 py-10">
      <a href="/account" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-wine"><ArrowLeft size={16} />My orders</a>
      <div className="flex flex-wrap items-center justify-between gap-4 border bg-white p-6"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Current status</p><h2 className="mt-2 text-3xl text-wine">{order.orderStatus}</h2><p className="mt-3 text-sm">{paymentLabel(order.paymentMethod)} · <b>{order.paymentStatus}</b></p></div><button onClick={() => result.refetch()} className="min-h-11 border px-4 text-sm">Refresh status</button></div>
      {order.paymentMethod === "cod" && order.paymentStatus !== "Paid" && order.orderStatus !== "Cancelled" && <p className="border border-gold/40 bg-secondary p-5 text-sm leading-7">Pay {formatINR(Number(order.totalAmount))} when your parcel arrives. Payment will be marked received after collection.</p>}
      {order.paymentMethod === "upi" && !["Paid", "Refunded"].includes(order.paymentStatus) && order.orderStatus !== "Cancelled" && <div className="border bg-white p-5"><p className="text-sm">Payment is not yet confirmed. Your order is saved.</p><button disabled={paying || !options.data?.data.onlinePaymentAvailable} className="mt-3 border px-5 py-3 text-sm disabled:opacity-50" onClick={async () => { setPaying(true); setPaymentError(""); try { await payForOrder(order.orderNumber); await result.refetch(); } catch (error) { setPaymentError(error instanceof Error ? error.message : "Payment could not be completed."); } finally { setPaying(false); } }}>{options.data?.data.onlinePaymentAvailable ? "Pay securely with Razorpay" : "Online payments currently disabled"}</button>{paymentError && <p role="alert" className="mt-3 text-sm">{paymentError}</p>}</div>}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6"><article className="border bg-white p-6"><h2 className="mb-6 flex items-center gap-2 text-2xl text-wine"><Truck size={22} />Parcel tracking</h2><p className="text-sm">{order.deliveryMode === "Pickup" ? "Store pickup" : order.courierName || "Your parcel is being prepared by the store."}</p>{order.trackingNumber && <p className="mt-3 break-all text-sm">Tracking / AWB: <b>{order.trackingNumber}</b></p>}{order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 border border-wine px-4 text-sm text-wine">Track with courier <ExternalLink size={14} /></a>}<p className="mt-4 text-xs leading-6 text-muted-foreground">Status updates are provided by the store. Use the courier link for the courier's latest parcel location.</p></article><article className="border bg-white p-6"><h2 className="mb-6 text-2xl text-wine">Order updates</h2><OrderTimeline order={order} /></article></div>
        <article className="space-y-7 border bg-white p-6"><h2 className="flex items-center gap-2 text-2xl text-wine"><Package size={22} />Order details</h2><OrderContents order={order} /><div className="border-t pt-5"><h3 className="font-sans text-sm font-semibold">{order.deliveryMode === "Pickup" ? "Pickup" : "Delivery address"}</h3><p className="mt-2 text-sm leading-7">{order.customerName}<br />{readableAddress(order.shippingAddress)}<br />{order.phone}</p></div></article>
      </div>
    </section>
  </>;
}
