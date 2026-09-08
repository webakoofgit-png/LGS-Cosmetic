import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminPageHeader, AdminShell, PageCard } from "@/components/admin/admin-shell";
import { ADMIN_API_BASE } from "@/lib/admin-api";
import { getAdminToken } from "@/lib/admin-session";

type Coupon = { id: number; code: string; discountType: string; discountValue: number | string; minOrderAmount: number | string; maxDiscount?: number | string | null; status: string; expiresAt?: string | null };
const blank = { code: "", discountType: "percentage", discountValue: "", minOrderAmount: "0", maxDiscount: "", expiresAt: "", status: "Active" };

export const Route = createFileRoute("/admin/coupons")({
  beforeLoad: () => { if (typeof window !== "undefined" && !getAdminToken()) throw redirect({ to: "/admin/login" }); },
  component: () => <AdminShell><CouponPage /></AdminShell>,
});

function CouponPage() {
  const token = getAdminToken();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const load = async () => { const response = await fetch(`${ADMIN_API_BASE}/api/coupons`, { headers: { Authorization: `Bearer ${token}` } }); const data = await response.json(); setCoupons(data?.data || []); };
  useEffect(() => { load(); }, []);
  const update = (key: keyof typeof blank, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function save(event: React.FormEvent) {
    event.preventDefault(); setMessage("");
    const response = await fetch(`${ADMIN_API_BASE}/api/coupons${editingId ? `/${editingId}` : ""}`, { method: editingId ? "PUT" : "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ ...form, discountValue: Number(form.discountValue), minOrderAmount: Number(form.minOrderAmount || 0), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null, expiresAt: form.expiresAt || null }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data?.message || "Unable to save coupon."); return; }
    setMessage("Coupon saved successfully."); setForm(blank); setEditingId(null); load();
  }
  async function remove(id: number) { if (!window.confirm("Delete this coupon?")) return; await fetch(`${ADMIN_API_BASE}/api/coupons/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); load(); }
  return <div className="space-y-6">
    <AdminPageHeader title="Coupons" sub="Create discount codes customers can apply at checkout." />
    <PageCard><form onSubmit={save} className="grid gap-4 md:grid-cols-3">
      <Field label="Coupon code *" value={form.code} onChange={(v) => update("code", v.toUpperCase())} placeholder="WELCOME10" />
      <Select label="Discount type" value={form.discountType} onChange={(v) => update("discountType", v)} options={[{ value: "percentage", label: "Percentage (%)" }, { value: "fixed", label: "Fixed amount (₹)" }]} />
      <Field label="Discount value *" type="number" value={form.discountValue} onChange={(v) => update("discountValue", v)} placeholder="10" />
      <Field label="Minimum order (₹)" type="number" value={form.minOrderAmount} onChange={(v) => update("minOrderAmount", v)} />
      <Field label="Maximum discount (₹)" type="number" value={form.maxDiscount} onChange={(v) => update("maxDiscount", v)} placeholder="Optional" />
      <Field label="Expiry date" type="date" value={form.expiresAt} onChange={(v) => update("expiresAt", v)} />
      <Select label="Status" value={form.status} onChange={(v) => update("status", v)} options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]} />
      <div className="flex items-end gap-2"><button className="rounded-xl bg-[#7f1d1d] px-4 py-2.5 text-sm font-semibold text-white">{editingId ? "Update coupon" : "Add coupon"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blank); }} className="rounded-xl border px-4 py-2.5 text-sm">Cancel</button>}</div>
    </form>{message && <p className="mt-3 text-sm text-stone-600">{message}</p>}</PageCard>
    <PageCard><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase tracking-widest text-stone-400"><th className="px-3 py-3">Code</th><th className="px-3 py-3">Discount</th><th className="px-3 py-3">Minimum</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th></tr></thead><tbody>{coupons.map((coupon) => <tr key={coupon.id} className="border-b"><td className="px-3 py-4 font-semibold">{coupon.code}</td><td className="px-3 py-4">{coupon.discountType === "fixed" ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`}</td><td className="px-3 py-4">₹{coupon.minOrderAmount}</td><td className="px-3 py-4">{coupon.status}</td><td className="px-3 py-4"><button onClick={() => { setEditingId(coupon.id); setForm({ code: coupon.code, discountType: coupon.discountType, discountValue: String(coupon.discountValue), minOrderAmount: String(coupon.minOrderAmount), maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "", expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "", status: coupon.status }); }} className="mr-2 underline">Edit</button><button onClick={() => remove(coupon.id)} className="text-red-600 underline">Delete</button></td></tr>)}</tbody></table></div></PageCard>
  </div>;
}
function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) { return <label className="grid gap-1.5 text-sm font-medium text-stone-700">{label}<input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl border border-[#ddd2c5] px-3 outline-none focus:border-[#7f1d1d]" /></label>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) { return <label className="grid gap-1.5 text-sm font-medium text-stone-700">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl border border-[#ddd2c5] px-3 outline-none focus:border-[#7f1d1d]">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }
