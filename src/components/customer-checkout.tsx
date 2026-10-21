import { useQuery } from "@tanstack/react-query";
import { payForOrder } from "@/lib/razorpay";
import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { PageHero } from "./commerce";
import { useShop } from "@/lib/shop-store";
import { customerRequest, useCustomer, type CustomerOrder } from "@/lib/customer-api";
import { formatINR } from "@/data/site";

type AvailableCoupon = { code: string; discountType: string; discountValue: string | number; minOrderAmount: string | number; maxDiscount: string | number | null; expiresAt: string | null };

export function CustomerCheckout() {
  const { lines, subtotal, clearCart, setQty, removeFromCart } = useShop();
  const session = useCustomer();
  const options = useQuery({ queryKey: ["checkout-options"], queryFn: () => customerRequest<{ data: { onlinePaymentAvailable: boolean } }>("/api/customer/checkout-options"), enabled: Boolean(session.data?.user) });
  const coupons = useQuery({ queryKey: ["available-coupons"], queryFn: () => customerRequest<{ data: AvailableCoupon[] }>("/api/coupons/available"), staleTime: 0, refetchInterval: 60_000 });
  const [appliedCode, setAppliedCode] = useState("");
  const [pickup, setPickup] = useState(false);
  const [payment, setPayment] = useState("cod");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const key = useRef<string | null>(null);
  const delivery = pickup || subtotal >= 999 ? 0 : 79;
  const user = session.data?.user;

  async function applyCoupon(code = coupon) {
    setCoupon(code); setAppliedCode("");
    setCheckingCoupon(true); setCouponMessage(""); setDiscount(0);
    try {
      const { ADMIN_API_BASE } = await import("@/lib/admin-api");
      const response = await fetch(`${ADMIN_API_BASE}/api/coupons/validate/${encodeURIComponent(code.trim())}?subtotal=${subtotal}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid coupon.");
      setAppliedCode(data.data.code); setDiscount(Number(data.data.discount)); setCouponMessage("Coupon applied. The final discount is verified when your order is placed.");
    } catch (err) { setCouponMessage(err instanceof Error ? err.message : "Unable to check coupon."); }
    finally { setCheckingCoupon(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    key.current ??= crypto.randomUUID();
    try {
      const payload = await customerRequest<{ data: CustomerOrder }>("/api/customer/orders", {
        checkoutKey: key.current, name: form.get("name"), phone: form.get("phone"),
        address: Object.fromEntries(["street", "city", "district", "state", "pincode"].map((field) => [field, form.get(field) || ""])),
        paymentMethod: payment, deliveryMode: pickup ? "Pickup" : "Delivery", couponCode: discount > 0 ? appliedCode : "",
        items: lines.map(({ line, product }) => ({ productId: Number(product.id.replace(/^admin-/, "")), quantity: line.qty, variant: line.variant })),
      });
      clearCart();
      if (payment === "upi") { try { await payForOrder(payload.data.orderNumber); } catch { /* Order remains saved; retry from its tracking page. */ } }
      window.location.assign(`/orders/${payload.data.orderNumber}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Order could not be placed. Your bag is saved."); setBusy(false); }
  }
  if (!lines.length) return <><PageHero title="Your Bag Is Empty" copy="Add a beauty favourite before checking out." /><section className="container-lv py-16 text-center"><ShoppingBag className="mx-auto text-wine" size={36} /><a href="/shop" className="mt-6 inline-flex min-h-12 items-center gap-3 bg-wine px-6 text-sm font-semibold text-white">Explore products <ArrowRight size={16} /></a></section></>;
  if (session.isPending) return <section className="container-lv py-16" role="status">Loading checkout…</section>;
  if (!user) return <><PageHero title="Secure Checkout" copy="Sign in to keep your order history and parcel tracking together." /><section className="container-lv py-14"><div className="mx-auto max-w-xl border bg-white p-7 text-center"><h2 className="text-3xl text-wine">Sign in to place your order</h2><p className="mt-4 text-sm leading-7">Your bag is saved. Create an account or sign in to continue checkout and track your parcel.</p><a href="/account?next=/checkout" className="mt-6 inline-flex min-h-12 items-center bg-wine px-6 text-sm font-semibold text-white">Sign in / Register</a></div></section></>;
  return <>
    <PageHero title="Secure Checkout" copy="Place your order and track every update from your account." />
    <section className="container-lv grid items-start gap-7 py-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <form id="checkout-form" onSubmit={submit} className="min-w-0 space-y-6">
        <div className="bg-white p-5 sm:p-7"><h2 className="text-2xl text-wine">1. Contact information</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm">Full name<input name="name" defaultValue={user.name} autoComplete="name" required maxLength={120} className="h-12 border px-3" /></label><label className="grid gap-2 text-sm">Phone number<input name="phone" type="tel" autoComplete="tel" required pattern="[+0-9 ()-]{10,20}" maxLength={20} className="h-12 border px-3" /></label><label className="grid gap-2 text-sm sm:col-span-2">Account email<input value={user.email} readOnly className="h-12 border bg-stone-50 px-3" /></label></div></div>
        <div className="bg-white p-5 sm:p-7"><h2 className="text-2xl text-wine">2. Delivery address</h2><label className="mt-5 flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={pickup} onChange={(e) => { setPickup(e.target.checked); if (!e.target.checked && payment === "store") setPayment("cod"); }} className="size-4 accent-wine" />Pick up from our Koregaon store</label>{!pickup && <div className="mt-5 grid gap-4 sm:grid-cols-2">{[{ name: "street", title: "House, building & street", auto: "street-address" }, { name: "city", title: "City / Town", auto: "address-level2" }, { name: "pincode", title: "PIN code", auto: "postal-code" }, { name: "district", title: "District", auto: "off" }, { name: "state", title: "State", auto: "address-level1" }].map((field) => <label key={field.name} className={`grid gap-2 text-sm ${field.name === "street" ? "sm:col-span-2" : ""}`}>{field.title}<input name={field.name} autoComplete={field.auto} defaultValue={field.name === "state" ? "Maharashtra" : ""} required maxLength={field.name === "pincode" ? 6 : 250} {...(field.name === "pincode" ? { pattern: "[1-9][0-9]{5}", inputMode: "numeric" as const } : {})} className="h-12 border px-3" /></label>)}</div>}</div>
        <div className="bg-white p-5 sm:p-7"><h2 className="text-2xl text-wine">3. Payment method</h2><div className="mt-5 space-y-3">{[{ value: "cod", title: "Cash on Delivery", text: "Pay the order total when your parcel arrives." }, ...(options.data?.data.onlinePaymentAvailable ? [{ value: "upi", title: "UPI / Online payment", text: "Pay securely through Razorpay. Payment is confirmed by the server." }] : []), ...(pickup ? [{ value: "store", title: "Pay at store", text: "Pay when you collect your order." }] : [])].map((item) => <label key={item.value} className={`flex min-h-20 items-center gap-4 border p-4 ${payment === item.value ? "border-wine bg-secondary" : ""}`}><input type="radio" name="paymentMethod" value={item.value} checked={payment === item.value} onChange={() => setPayment(item.value)} className="size-4 accent-wine" /><span><b className="block text-sm">{item.title}</b><span className="mt-1 block text-xs leading-6 text-muted-foreground">{item.text}</span></span></label>)}{!options.data?.data.onlinePaymentAvailable && <div className="border bg-stone-50 p-4 text-sm text-muted-foreground"><b>UPI / Online payment</b><p className="mt-1 text-xs leading-6">Temporarily unavailable. Please choose cash on delivery or store pickup.</p></div>}</div></div>
      </form>
      <aside className="min-w-0 space-y-5 bg-white p-5 sm:p-7 lg:sticky lg:top-32"><h2 className="text-3xl text-wine">Order Summary</h2><div className="space-y-4">{lines.map(({ line, product }) => <div key={`${product.id}-${line.variant || ""}`} className="flex gap-3 border-b pb-4"><img src={product.image} alt={product.name} className="size-16 shrink-0 object-contain" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{product.name}</p><p className="mt-1 text-xs text-muted-foreground">{line.variant}</p><div className="mt-2 flex flex-wrap items-center justify-between gap-2"><label className="text-xs">Qty <input aria-label={`Quantity for ${product.name}`} type="number" min={1} max={product.stock || 99} value={line.qty} disabled={busy || checkingCoupon} onChange={(e) => { setQty(product.id, Math.max(1, Number(e.target.value)), line.shade, line.variant); setDiscount(0); }} className="ml-1 h-9 w-14 border px-2" /></label><b className="text-xs">{formatINR((product.variants?.find((v) => v.label === line.variant)?.price ?? product.price) * line.qty)}</b></div><button disabled={busy} onClick={() => { removeFromCart(product.id, line.shade, line.variant); setDiscount(0); }} className="mt-1 min-h-9 text-xs underline">Remove</button></div></div>)}</div>
        <div><label htmlFor="order-coupon" className="text-xs font-semibold uppercase">Coupon code</label><div className="mt-2 flex gap-2"><input id="order-coupon" disabled={checkingCoupon || busy} value={coupon} onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setDiscount(0); }} className="h-11 min-w-0 flex-1 border px-3" /><button type="button" disabled={checkingCoupon || !coupon.trim() || busy} onClick={() => void applyCoupon()} className="bg-wine px-3 text-xs font-semibold text-white disabled:opacity-50">Apply</button></div>{couponMessage && <p role="status" className="mt-2 text-xs leading-6">{couponMessage}</p>}</div>
        <section aria-labelledby="available-coupons-title" className="border-t pt-5"><h3 id="available-coupons-title" className="font-sans text-sm font-semibold">Available Coupons</h3>
          {coupons.isPending ? <p className="mt-3 text-xs" role="status">Loading offers...</p> : coupons.isError ? <div className="mt-3 text-xs"><p>Unable to load offers.</p><button type="button" onClick={() => coupons.refetch()} className="mt-2 min-h-9 text-wine underline">Retry</button></div> : !coupons.data?.data.length ? <p className="mt-3 text-xs text-muted-foreground">No coupons available right now.</p> : <div className="mt-3 space-y-3">{coupons.data.data.map((offer) => {
            const minimum = Number(offer.minOrderAmount), eligible = subtotal >= minimum;
            const applied = appliedCode === offer.code && discount > 0;
            return <article key={offer.code} className={`min-w-0 rounded-lg border border-dashed p-3 ${applied ? "border-wine bg-secondary" : "border-wine/30"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-all text-sm font-bold tracking-wide text-wine">{offer.code}</p><p className="mt-1 text-sm font-semibold">{offer.discountType === "fixed" ? formatINR(Number(offer.discountValue)) : `${Number(offer.discountValue)}%`} off</p></div><button type="button" disabled={!eligible || checkingCoupon || busy || applied} onClick={() => void applyCoupon(offer.code)} className="min-h-10 shrink-0 border border-wine px-3 text-xs font-semibold text-wine disabled:opacity-50">{applied ? "Applied" : "Apply"}</button></div><p className="mt-2 text-xs leading-6 text-muted-foreground">{minimum > 0 ? `Minimum order ${formatINR(minimum)}` : "No minimum order"}{offer.maxDiscount != null ? ` ? Maximum discount ${formatINR(Number(offer.maxDiscount))}` : ""}{offer.expiresAt ? ` ? Expires ${new Date(offer.expiresAt).toLocaleDateString("en-IN")}` : ""}</p>{!eligible && <p className="mt-1 text-xs text-wine">Add {formatINR(minimum - subtotal)} more to use this coupon.</p>}</article>;
          })}</div>}
        </section>
        <dl className="space-y-3 text-sm">{[["Subtotal", subtotal], ["Delivery", delivery], ["Discount", -discount], ["Total", Math.max(subtotal - discount + delivery, 0)]].map(([label, value]) => <div key={String(label)} className="flex justify-between gap-4"><dt>{label}</dt><dd className="font-semibold">{formatINR(Number(value))}</dd></div>)}</dl>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button form="checkout-form" type="submit" disabled={busy} className="min-h-12 w-full bg-wine px-5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Placing order…" : "Place order"}</button><p className="text-xs leading-6 text-muted-foreground">The final price, coupon and stock are verified before your order is placed.</p>
      </aside>
    </section>
  </>;
}
