import { AdminOrdersPage } from "./admin-orders";
import { useEffect, useState, type FormEvent } from "react";
import { AdminPageHeader, PageCard } from "./admin-shell";
import { ADMIN_API_BASE } from "@/lib/admin-api";
import { getAdminToken } from "@/lib/admin-session";
import { Pencil, Trash2 } from "lucide-react";
import { WebsiteEditor } from "./website-editor";
import { AdminUsersPage } from "./admin-users";

type Field = { key: string; label: string; required?: boolean; multiline?: boolean; options?: string[] };
type RecordRow = { id: number; [key: string]: unknown };
const configurations: Record<string, { title: string; endpoint: string; listEndpoint?: string; fields: Field[]; create?: boolean }> = {
  categories: { title: "Categories", endpoint: "product-categories", create: true, fields: [
    { key: "name", label: "Name", required: true }, { key: "slug", label: "Slug", required: true },
    { key: "description", label: "Description", multiline: true }, { key: "group", label: "Group" },
    { key: "status", label: "Status", options: ["Active", "Inactive"] },
  ] },
  blogs: { title: "Blogs", endpoint: "blogs", create: true, fields: [
    { key: "title", label: "Title", required: true }, { key: "slug", label: "Slug", required: true },
    { key: "author", label: "Author" }, { key: "excerpt", label: "Excerpt", multiline: true },
    { key: "content", label: "Article content", multiline: true },
    { key: "status", label: "Status", options: ["Draft", "Published"] },
  ] },
  reviews: { title: "Reviews", endpoint: "reviews", listEndpoint: "reviews/admin", create: true, fields: [
    { key: "reviewerName", label: "Reviewer name", required: true },
    { key: "rating", label: "Star rating", options: ["5", "4", "3", "2", "1"] },
    { key: "text", label: "Original review text", multiline: true },
    { key: "reviewUrl", label: "Original review link" },
    { key: "source", label: "Source", options: ["Google", "Customer"] },
    { key: "status", label: "Status", options: ["Published", "Hidden"] },
  ] },
  orders: { title: "Orders", endpoint: "orders", fields: [
    { key: "orderNumber", label: "Order number" }, { key: "customerName", label: "Customer" },
    { key: "email", label: "Email" }, { key: "phone", label: "Phone" },
    { key: "totalAmount", label: "Total (INR)" },
    { key: "orderStatus", label: "Order status", options: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"] },
    { key: "paymentStatus", label: "Payment status", options: ["Pending", "Paid", "Failed", "Refunded"] },
  ] },
};
const titles: Record<string, string> = { banners: "Banners", reviews: "Reviews", content: "Page Content", seo: "SEO", settings: "Settings", "admin-users": "Admin Users" };

export function AdminSection({ section }: { section: string }) {
  if (section === "orders") return <AdminOrdersPage />;
  if (section === "admin-users") return <AdminUsersPage />;
  if (section === "seo" || section === "content" || section === "settings") return <WebsiteEditor key={section} mode={section} />;
  const config = configurations[section];
  if (config) return <ResourcePage key={section} config={config} />;
  return <div className="space-y-6">
    <AdminPageHeader title={titles[section] ?? "Administration"} sub="LGS Cosmetics website management." />
    <PageCard>
        <div><h2 className="text-lg font-semibold">{titles[section]}</h2><p className="mt-3 text-sm leading-6 text-stone-600">{section === "reviews" ? "Review management is not configured yet." : "This content is currently maintained in the website source. Editing it from the admin panel is not configured yet."}</p></div>
    </PageCard>
  </div>;
}

function ResourcePage({ config }: { config: (typeof configurations)[string] }) {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const headers = () => ({ Authorization: `Bearer ${getAdminToken()}`, "Content-Type": "application/json" });

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        const items: RecordRow[] = [];
        for (let page = 1; ; page++) {
          const response = await fetch(`${ADMIN_API_BASE}/api/${config.listEndpoint ?? config.endpoint}?limit=100&page=${page}`, { headers: headers(), signal: controller.signal });
          const payload = await response.json();
          if (!response.ok || !Array.isArray(payload.data)) throw new Error(payload.message || "Unable to load records.");
          items.push(...payload.data);
          if (page >= (payload.pagination?.totalPages ?? 1)) break;
        }
        setRows(items);
      } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Unable to load records."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [config.endpoint, version]);

  function open(row?: RecordRow) {
    setError(""); setEditing(row?.id ?? "new");
    setForm(Object.fromEntries(config.fields.map((field) => [field.key, String(row?.[field.key] ?? field.options?.[0] ?? "")])));
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const body = config.endpoint === "orders" ? { orderStatus: form["orderStatus"], paymentStatus: form["paymentStatus"] } : form;
      const response = await fetch(`${ADMIN_API_BASE}/api/${config.endpoint}${editing === "new" ? "" : `/${editing}`}`, { method: editing === "new" ? "POST" : "PUT", headers: headers(), body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Unable to save record.");
      setEditing(null); setVersion((v) => v + 1);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save record."); }
    finally { setSaving(false); }
  }
  async function remove(row: RecordRow) {
    const label = String(row["reviewerName"] ?? row["name"] ?? row["title"] ?? row["orderNumber"] ?? "this record");
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setDeletingId(row.id); setError("");
    try {
      const response = await fetch(`${ADMIN_API_BASE}/api/${config.endpoint}/${row.id}`, { method: "DELETE", headers: headers() });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to delete record.");
      setRows((current) => current.filter((item) => item.id !== row.id));
      if (editing === row.id) setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete record.");
    } finally { setDeletingId(null); }
  }
  return <div className="space-y-6">
    <AdminPageHeader title={config.title} sub={`Manage ${config.title.toLowerCase()} for LGS Cosmetics.`} action={config.create ? <button type="button" onClick={() => open()} className="rounded-xl bg-[#7f1d1d] px-4 py-3 text-sm font-semibold text-white">+ Add {config.title === "Categories" ? "Category" : config.title === "Reviews" ? "Review" : "Blog"}</button> : undefined} />
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {editing !== null && <PageCard><form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
      {config.fields.map((field) => <label key={field.key} className={`grid gap-2 text-sm font-medium ${field.multiline ? "sm:col-span-2" : ""}`}>
        {field.label}{field.required ? " *" : ""}
        {field.options ? <select className="rounded-lg border p-3" value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}>{Array.from(new Set([...field.options, form[field.key]])).filter(Boolean).map((option) => <option key={option}>{option}</option>)}</select> : field.multiline ? <textarea className="min-h-32 rounded-lg border p-3" value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} /> : <input className="rounded-lg border p-3" required={field.required} readOnly={config.endpoint === "orders"} value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} />}
      </label>)}
      <div className="flex gap-3 sm:col-span-2"><button disabled={saving} className="rounded-lg bg-[#7f1d1d] px-5 py-3 text-white disabled:opacity-50">{saving ? "Saving…" : "Save"}</button><button type="button" disabled={saving} onClick={() => setEditing(null)} className="rounded-lg border px-5 py-3">Cancel</button></div>
    </form></PageCard>}
    <PageCard>{loading ? <p role="status">Loading…</p> : error && rows.length === 0 ? <button type="button" onClick={() => setVersion((v) => v + 1)} className="rounded-lg border px-4 py-2">Retry</button> : rows.length === 0 ? <p>No {config.title.toLowerCase()} yet.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{config.fields.filter((f) => !f.multiline).map((f) => <th className="border-b p-3" key={f.key}>{f.label}</th>)}<th className="border-b p-3">Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{config.fields.filter((f) => !f.multiline).map((f) => <td className={`border-b p-3 ${f.key === "phone" ? "whitespace-nowrap" : ""}`} key={f.key}>{String(row[f.key] ?? "—")}</td>)}<td className="border-b p-3"><div className="flex items-center gap-2">
<button type="button" onClick={() => open(row)} disabled={saving || deletingId !== null} aria-label={`Edit ${String(row["name"] ?? row["title"] ?? row["orderNumber"] ?? "record")}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#ead1d1] bg-[#f8eded] px-4 py-2 text-xs font-semibold text-[#7f1d1d] transition hover:border-[#7f1d1d] hover:bg-[#f1dddd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7f1d1d] disabled:cursor-not-allowed disabled:opacity-50"><Pencil size={14} aria-hidden="true" />Edit</button>
<button type="button" onClick={() => remove(row)} disabled={saving || deletingId !== null} aria-label={`Delete ${String(row["name"] ?? row["title"] ?? row["orderNumber"] ?? "record")}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={14} aria-hidden="true" />{deletingId === row.id ? "Deleting..." : "Delete"}</button>
</div></td></tr>)}</tbody></table></div>}</PageCard>
  </div>;
}
