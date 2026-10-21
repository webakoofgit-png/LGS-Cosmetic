import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader, PageCard } from "./admin-shell";
import { ADMIN_API_BASE } from "@/lib/admin-api";
import { getAdminToken } from "@/lib/admin-session";
import { editablePages, readSiteSetting, seoDefaults } from "@/lib/site-settings";
import { generalDefaults } from "@/lib/general-settings";

type EditorField = { key: string; label: string; limit: number; multiline?: boolean; required?: boolean; type?: string; help?: string; group?: string };
const generalFields: EditorField[] = [
  { key: "name", label: "Brand / store name", limit: 150, required: true, group: "Brand details" },
  { key: "tagline", label: "Tagline", limit: 250 },
  { key: "phone", label: "Contact phone number", limit: 40, required: true, type: "tel", group: "Contact & address", help: "Shown on the contact page and in the website footer." },
  { key: "whatsapp", label: "WhatsApp number", limit: 20, required: true, type: "tel", help: "Include country code, digits only. Example: 919860964571" },
  { key: "addressLine1", label: "Address line 1", limit: 250, required: true },
  { key: "addressLine2", label: "City, state & PIN code", limit: 250 },
  { key: "mapsLink", label: "Google Maps link", limit: 500, type: "url", help: "Used by the Get Directions button." },
  { key: "instagram", label: "Instagram profile link", limit: 500, type: "url", group: "Social profiles", help: "Example: https://www.instagram.com/lgs_cosmetics/" },
  { key: "instagramHandle", label: "Instagram username", limit: 100, help: "Example: @lgs_cosmetics" },
  { key: "facebook", label: "Facebook page link", limit: 500, type: "url" },
];
const seoFields: EditorField[] = [
  { key: "title", label: "Website title", limit: 180 },
  { key: "description", label: "Search description", limit: 500, multiline: true },
  { key: "keywords", label: "Keywords (separate with commas)", limit: 500 },
  { key: "socialTitle", label: "Social sharing title", limit: 180 },
  { key: "socialDescription", label: "Social sharing description", limit: 500, multiline: true },
];
const contentFields: EditorField[] = [
  { key: "title", label: "Page heading", limit: 180 },
  { key: "intro", label: "Page introduction", limit: 1000, multiline: true },
  { key: "body", label: "Additional page text", limit: 30000, multiline: true },
];

export function WebsiteEditor({ mode }: { mode: "seo" | "content" | "settings" }) {
  const [selected, setSelected] = useState("/about");
  const page = editablePages.find((item) => item.path === selected)!;
  return <div className="space-y-6">
    <AdminPageHeader title={mode === "settings" ? "Store Settings" : mode === "seo" ? "SEO" : "Page Content"} sub={mode === "settings" ? "Update your brand, phone, address and social links here. Save changes to update these details across the website." : mode === "seo" ? "Manage your website's search and social sharing information." : "Edit page headings, introductions and additional text."} />
    {mode === "content" && <PageCard><label className="grid max-w-md gap-2 text-sm font-semibold">Select page
      <select value={selected} onChange={(event) => setSelected(event.target.value)} className="h-12 rounded-xl border px-3">{editablePages.map((item) => <option key={item.path} value={item.path}>{item.title}</option>)}</select>
    </label></PageCard>}
    <SettingsForm key={`${mode}-${selected}`} settingKey={mode === "settings" ? "general" : mode === "seo" ? "seo" : `page-${selected.slice(1)}`} fields={mode === "settings" ? generalFields : mode === "seo" ? seoFields : contentFields} defaults={mode === "settings" ? generalDefaults : mode === "seo" ? seoDefaults : { title: page.title, intro: page.intro, body: "" }} previewPath={mode === "content" ? selected : "/"} />
  </div>;
}

function SettingsForm({ settingKey, fields, defaults, previewPath }: { settingKey: string; fields: EditorField[]; defaults: Record<string, string>; previewPath: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setLoadFailed(false); setError("");
    readSiteSetting<Record<string, string>>(settingKey, controller.signal)
      .then((value) => { if (!controller.signal.aborted) setForm({ ...defaults, ...value }); })
      .catch(() => { if (!controller.signal.aborted) { setLoadFailed(true); setError("Unable to load saved settings. Check the backend and database, then retry."); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  // The parent mounts a fresh editor when the setting changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingKey, retry]);

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const response = await fetch(`${ADMIN_API_BASE}/api/site-settings/${settingKey}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAdminToken()}` }, body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to save changes.");
      await queryClient.invalidateQueries({ queryKey: ["page-content"] });
      await queryClient.invalidateQueries({ queryKey: ["general-settings"] });
      setSuccess("Changes saved. Refresh the website page to see the update.");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save changes."); }
    finally { setSaving(false); }
  }

  return <PageCard>
    {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
    {success && <p role="status" className="mb-4 text-sm text-green-700">{success}</p>}
    {loading ? <p role="status">Loading saved settings…</p> : loadFailed ? <button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-xl border px-4 py-3">Retry</button> : <form onSubmit={save} className="max-w-3xl space-y-5">
      {fields.map((field) => <div key={field.key}>
        {field.group && <h2 className="mb-5 border-b pb-3 text-lg font-semibold text-[#7f1d1d]">{field.group}</h2>}
        <label className="grid gap-2 text-sm font-semibold text-stone-700">{field.label}{field.required ? " *" : ""}
        {field.multiline ? <textarea rows={field.key === "body" ? 8 : 3} maxLength={field.limit} value={form[field.key] ?? ""} onChange={(event) => { setForm({ ...form, [field.key]: event.target.value }); setSuccess(""); }} className="rounded-xl border border-[#ddd2c5] p-3 font-normal focus:border-[#7f1d1d]" /> : <input type={field.type ?? "text"} required={field.required || field.key === "title"} maxLength={field.limit} value={form[field.key] ?? ""} onChange={(event) => { setForm({ ...form, [field.key]: event.target.value }); setSuccess(""); }} className="h-12 rounded-xl border border-[#ddd2c5] px-3 font-normal focus:border-[#7f1d1d]" />}
        {field.help && <span className="text-xs font-normal leading-5 text-stone-500">{field.help}</span>}
        <span className="text-xs font-normal text-stone-400">{(form[field.key] ?? "").length}/{field.limit}</span>
      </label></div>)}
      {settingKey === "seo" && <div className="rounded-xl border bg-stone-50 p-5"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">Search preview</p><p className="text-xl text-blue-800">{form["title"]}</p><p className="mt-2 text-sm text-stone-600">{form["description"]}</p></div>}
      <div className="flex flex-wrap items-center gap-3"><button disabled={saving} className="rounded-xl bg-[#7f1d1d] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button><a href={previewPath} target="_blank" rel="noreferrer" className="rounded-xl border px-5 py-3 text-sm font-semibold">View page</a></div>
    </form>}
  </PageCard>;
}
