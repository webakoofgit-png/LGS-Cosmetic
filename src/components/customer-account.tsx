import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LogOut, Package, Truck, ShoppingBag } from "lucide-react";
import { PageHero } from "./commerce";
import { customerRequest, paymentLabel, useCustomer, useCustomerOrders } from "@/lib/customer-api";
import { formatINR } from "@/data/site";

export function CustomerAccountPage() {
  const queryClient = useQueryClient();
  const session = useCustomer();
  const customer = session.data?.user;
  const orders = useCustomerOrders(customer?.id);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const returningToCheckout = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("next") === "/checkout";

  async function authenticate(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await customerRequest(`/api/customer-auth/${mode === "register" ? "sign-up" : "sign-in"}/email`, { ...(mode === "register" ? { name: form.name.trim() } : {}), email: form.email.trim().toLowerCase(), password: form.password });
      setForm({ name: "", email: "", password: "" });
      queryClient.removeQueries({ queryKey: ["customer-orders"] });
      queryClient.removeQueries({ queryKey: ["customer-order"] });
      await queryClient.invalidateQueries({ queryKey: ["customer-session"] });
      if (returningToCheckout) window.location.assign("/checkout");
    } catch (err) { setError(err instanceof Error ? err.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setError("");
    try { await customerRequest("/api/customer-auth/sign-out", {}); queryClient.setQueryData(["customer-session"], null); queryClient.removeQueries({ queryKey: ["customer-order"] }); queryClient.removeQueries({ queryKey: ["customer-orders"] }); }
    catch { setError("Unable to sign out. Please try again."); }
    finally { setBusy(false); }
  }
  if (session.isPending) return <section className="container-lv py-16" role="status">Loading your account…</section>;
  if (session.isError) return <section className="container-lv py-16"><p role="alert">Unable to load your account.</p><button onClick={() => session.refetch()} className="mt-4 border px-5 py-3">Retry</button></section>;
  if (!customer) return <>
    <PageHero title={mode === "login" ? "Welcome Back" : "Create Your Account"} copy="Sign in to place orders, track your parcel and view your order history." />
    <section className="container-lv py-12"><div className="mx-auto max-w-md border bg-white p-6 sm:p-8">
      {returningToCheckout && <p className="mb-5 rounded-lg bg-secondary p-3 text-sm">Sign in or create an account to continue checkout. Your bag is saved.</p>}
      <div className="mb-6 grid grid-cols-2 border-b">{(["login", "register"] as const).map((value) => <button type="button" key={value} onClick={() => { setMode(value); setError(""); }} className={`min-h-12 border-b-2 text-sm font-semibold ${mode === value ? "border-wine text-wine" : "border-transparent text-muted-foreground"}`}>{value === "login" ? "Sign in" : "Register"}</button>)}</div>
      <form onSubmit={authenticate} className="space-y-5">
        {mode === "register" && <label className="grid gap-2 text-sm font-semibold">Full name<input required maxLength={120} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 border px-3" /></label>}
        <label className="grid gap-2 text-sm font-semibold">Email address<input type="email" required maxLength={180} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 border px-3" /></label>
        <label className="grid gap-2 text-sm font-semibold">Password<input type="password" required minLength={8} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-12 border px-3" />{mode === "register" && <span className="text-xs font-normal text-muted-foreground">Use at least 8 characters.</span>}</label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="min-h-12 w-full bg-wine px-5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
      </form>
    </div></section>
  </>;
  const list = orders.data?.data || [], active = list.filter((order) => !["Delivered", "Cancelled"].includes(order.orderStatus));
  return <>
    <PageHero title="My Account" copy={`Welcome, ${customer.name}. Your orders and parcel updates, all in one place.`} />
    <section className="container-lv space-y-7 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border bg-white p-5"><div><h2 className="text-2xl text-wine">{customer.name}</h2><p className="mt-1 break-all text-sm text-muted-foreground">{customer.email}</p></div><button disabled={busy} onClick={signOut} className="inline-flex min-h-11 items-center gap-2 border px-4 text-sm"><LogOut size={16} />Sign out</button></div>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">{[[ShoppingBag, "All orders", list.length], [Truck, "In progress", active.length], [Package, "Delivered", list.filter((order) => order.orderStatus === "Delivered").length]].map(([Icon, label, count], index) => { const Component = Icon as typeof Package; return <div key={index} className="border bg-white p-5"><Component size={22} className="text-wine" /><p className="mt-3 text-sm text-muted-foreground">{String(label)}</p><p className="mt-2 text-3xl font-semibold">{String(count)}</p></div>; })}</div>
      <div className="flex items-center justify-between gap-3"><h2 className="text-3xl text-wine">Order History</h2><button onClick={() => orders.refetch()} className="min-h-11 border px-4 text-xs font-semibold">Refresh updates</button></div>
      {orders.isPending ? <p role="status">Loading orders…</p> : orders.isError ? <p role="alert">Unable to load your orders. Please refresh updates.</p> : list.length === 0 ? <div className="border bg-white p-8 text-center"><p>You have not placed any orders yet.</p><a href="/shop" className="mt-5 inline-flex items-center gap-2 font-semibold text-wine">Start shopping <ArrowRight size={16} /></a></div> : <div className="space-y-4">{list.map((order) => <article key={order.id} className="flex flex-wrap items-center justify-between gap-5 border bg-white p-5"><div><h3 className="font-sans text-sm font-bold">{order.orderNumber}</h3><p className="mt-2 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN")} · {order.items?.length || 0} items</p><p className="mt-3 text-sm font-semibold text-wine">{order.orderStatus}</p><p className="mt-1 text-xs">{paymentLabel(order.paymentMethod)} · {order.paymentStatus}</p></div><div><p className="text-lg font-bold">{formatINR(Number(order.totalAmount))}</p><a href={`/orders/${order.orderNumber}`} className="mt-3 inline-flex min-h-11 items-center gap-2 border border-wine px-4 text-xs font-semibold text-wine">View & track order <ArrowRight size={14} /></a></div></article>)}</div>}
    </section>
  </>;
}
