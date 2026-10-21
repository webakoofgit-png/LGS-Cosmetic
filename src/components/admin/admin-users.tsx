import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { AdminPageHeader, PageCard } from "./admin-shell";
import { ADMIN_API_BASE } from "@/lib/admin-api";
import { getAdminToken, setAdminSession, type AdminProfile } from "@/lib/admin-session";

type AdminUser = AdminProfile & { lastLoginAt?: string | null };
const blank = { name: "", email: "", password: "", role: "Admin", status: "Active" };
const editStyle = "inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#ead1d1] bg-[#f8eded] px-4 py-2 text-xs font-semibold text-[#7f1d1d] hover:bg-[#f1dddd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";
const deleteStyle = "inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [me, setMe] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const canManage = me?.role === "Super Admin";
  const editingSelf = editing === me?.id;
  const headers = () => ({ Authorization: `Bearer ${getAdminToken()}`, "Content-Type": "application/json" });

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        const responses = await Promise.all(["/api/admin-users", "/api/auth/me"].map(async (path) => {
          const response = await fetch(`${ADMIN_API_BASE}${path}`, { headers: headers(), signal: controller.signal });
          const payload = await response.json();
          if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to load administrators.");
          return payload;
        }));
        if (!controller.signal.aborted) { setUsers(responses[0].data); setMe(responses[1].data); }
      } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Unable to load administrators."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [version]);

  function open(user?: AdminUser) {
    setEditing(user?.id ?? "new"); setError(""); setSuccess("");
    setForm(user ? { name: user.name, email: user.email, password: "", role: user.role, status: user.status ?? "Active" } : blank);
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const response = await fetch(`${ADMIN_API_BASE}/api/admin-users${editing === "new" ? "" : `/${editing}`}`, { method: editing === "new" ? "POST" : "PUT", headers: headers(), body: JSON.stringify(form) });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to save administrator.");
      if (editingSelf && payload.token) { setAdminSession(payload.token, payload.data); setMe(payload.data); }
      setEditing(null); setForm(blank); setSuccess(editing === "new" ? "Administrator added. They can now sign in using their email and password." : "Administrator updated.");
      setVersion((value) => value + 1);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save administrator."); }
    finally { setSaving(false); }
  }
  async function remove(user: AdminUser) {
    if (!window.confirm(`Delete ${user.name} (${user.email})? They will lose access to the admin panel.`)) return;
    setDeletingId(user.id); setError(""); setSuccess("");
    try {
      const response = await fetch(`${ADMIN_API_BASE}/api/admin-users/${user.id}`, { method: "DELETE", headers: headers() });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to delete administrator.");
      setUsers((current) => current.filter((item) => item.id !== user.id));
      if (editing === user.id) { setEditing(null); setForm(blank); }
      setSuccess("Administrator deleted.");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to delete administrator."); }
    finally { setDeletingId(null); }
  }

  return <div className="space-y-6">
    <AdminPageHeader title="Admin Users" sub="Manage who can sign in to your admin panel." action={canManage && !loading ? <button type="button" disabled={saving || deletingId !== null} onClick={() => open()} className="inline-flex items-center gap-2 rounded-xl bg-[#7f1d1d] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Plus size={16} />Add Admin</button> : undefined} />
    <PageCard><p className="text-sm leading-6 text-stone-600"><b>Super Admin:</b> manages the website and administrator accounts.<br /><b>Admin:</b> manages website content and can edit their own profile.</p></PageCard>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {success && <p role="status" className="text-sm text-green-700">{success}</p>}
    {editing !== null && <PageCard>
      <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">{editing === "new" ? "Add administrator" : editingSelf ? "Edit your profile" : "Edit administrator"}</h2><button type="button" disabled={saving} onClick={() => { setEditing(null); setForm(blank); }} aria-label="Close editor" className="grid size-10 place-items-center"><X size={18} /></button></div>
      <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">Name *<input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 rounded-xl border px-3" /></label>
        <label className="grid gap-2 text-sm font-medium">Email *<input type="email" required maxLength={180} autoComplete="off" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 rounded-xl border px-3" /></label>
        <label className="grid gap-2 text-sm font-medium">{editing === "new" ? "Password *" : "New password"}<input type="password" required={editing === "new"} minLength={8} maxLength={72} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-12 rounded-xl border px-3" /><span className="text-xs font-normal text-stone-500">{editing === "new" ? "Use at least 8 characters." : "Leave blank to keep the current password. Changing it signs out previous sessions."}</span></label>
        <label className="grid gap-2 text-sm font-medium">Role<select disabled={editingSelf || !canManage} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="h-12 rounded-xl border px-3 disabled:bg-stone-100"><option>Admin</option><option>Super Admin</option></select></label>
        <label className="grid gap-2 text-sm font-medium">Status<select disabled={editingSelf || !canManage} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-12 rounded-xl border px-3 disabled:bg-stone-100"><option>Active</option><option>Inactive</option></select><span className="text-xs font-normal text-stone-500">Inactive users cannot sign in.</span></label>
        <div className="flex items-end gap-3 sm:col-span-2"><button disabled={saving || deletingId !== null} className="rounded-xl bg-[#7f1d1d] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button><button type="button" disabled={saving} onClick={() => { setEditing(null); setForm(blank); }} className="rounded-xl border px-5 py-3 text-sm">Cancel</button></div>
      </form>
    </PageCard>}
    <PageCard>{loading ? <p role="status">Loading administrators…</p> : error && users.length === 0 ? <button type="button" onClick={() => setVersion((value) => value + 1)} className="rounded-xl border px-4 py-3">Retry</button> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Name", "Email", "Role", "Status", "Last login", "Actions"].map((title) => <th key={title} className="whitespace-nowrap border-b p-3">{title}</th>)}</tr></thead><tbody>{users.map((user) => <tr key={user.id}>
      <td className="border-b p-3 font-medium">{user.name}{user.id === me?.id && <span className="ml-2 rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-500">You</span>}</td><td className="border-b p-3">{user.email}</td><td className="whitespace-nowrap border-b p-3">{user.role}</td><td className="border-b p-3"><span className={`rounded-full px-3 py-1 text-xs font-medium ${user.status === "Active" ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-600"}`}>{user.status}</span></td><td className="whitespace-nowrap border-b p-3">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) : "Never"}</td>
      <td className="border-b p-3"><div className="flex gap-2"><button type="button" onClick={() => open(user)} disabled={saving || deletingId !== null} aria-label={`Edit ${user.name}`} className={editStyle}><Pencil size={14} aria-hidden="true" />Edit</button>{canManage && user.id !== me?.id && <button type="button" onClick={() => remove(user)} disabled={saving || deletingId !== null} aria-label={`Delete ${user.name}`} className={deleteStyle}><Trash2 size={14} aria-hidden="true" />{deletingId === user.id ? "Deleting…" : "Delete"}</button>}</div></td>
    </tr>)}</tbody></table></div>}</PageCard>
  </div>;
}
