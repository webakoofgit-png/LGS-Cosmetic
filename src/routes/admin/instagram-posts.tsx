import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminPageHeader, AdminShell, PageCard } from "@/components/admin/admin-shell";
import { ADMIN_API_BASE, resolveImageUrl } from "@/lib/admin-api";
import { getAdminToken } from "@/lib/admin-session";

type InstagramPost = {
  id: number;
  image: string;
  caption?: string | null;
  link?: string | null;
};

export const Route = createFileRoute("/admin/instagram-posts")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAdminToken()) throw redirect({ to: "/admin/login" });
  },
  component: () => (
    <AdminShell>
      <InstagramPostsPage />
    </AdminShell>
  ),
});

function InstagramPostsPage() {
  const token = getAdminToken();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPosts() {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${ADMIN_API_BASE}/api/instagram-posts/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Unable to load reels");
      setPosts(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setMessage("Unable to load Instagram posts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function addPost(event: React.FormEvent) {
    event.preventDefault();
    if (!token || !link.trim()) {
      setMessage("Please enter an Instagram post or reel link.");
      return;
    }
    const body = new FormData();
    if (file) body.append("image", file);
    body.append("link", link);
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`${ADMIN_API_BASE}/api/instagram-posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to upload post.");
      setFile(null);
      setLink("");
      setMessage("Post uploaded successfully.");
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload post.");
    } finally {
      setSaving(false);
    }
  }

  async function removePost(id: number) {
    if (!token || !window.confirm("Remove this Instagram post?")) return;
    setSaving(true);
    try {
    const response = await fetch(`${ADMIN_API_BASE}/api/instagram-posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Unable to delete reel. Please try again.");
      setPosts((current) => current.filter((post) => post.id !== id));
      setMessage("Post removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete reel.");
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Instagram Posts" sub="Upload up to 12 reels; delete an existing reel to replace it for the homepage beauty gallery." />
      <PageCard>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Homepage gallery</h2>
            <p className="mt-1 text-sm text-stone-500">{posts.length} of 12 slots used</p>
          </div>
          <span className="rounded-full bg-[#f5e6e6] px-3 py-1 text-xs font-semibold text-[#7f1d1d]">Maximum 12</span>
        </div>
        <form onSubmit={addPost} className="grid gap-4 rounded-xl border border-dashed border-[#d9c8b8] bg-[#fcfaf7] p-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-stone-700">
            Thumbnail image (optional)
            <span className="text-xs font-normal text-stone-500">Leave empty to fetch the thumbnail from your Instagram link.</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} className="h-11 rounded-xl border border-[#ddd2c5] bg-white px-3 py-2 text-sm" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-stone-700 md:col-span-2">
            Instagram post/reel link *
            <input value={link} onChange={(event) => setLink(event.target.value)} type="url" required placeholder="https://www.instagram.com/reel/.../" className="h-11 rounded-xl border border-[#ddd2c5] bg-white px-3 outline-none focus:border-[#7f1d1d]" />
          </label>
          <div className="md:col-span-2">
            <button disabled={loading || saving || posts.length >= 12} className="rounded-xl bg-[#7f1d1d] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? "Saving reel and thumbnail..." : posts.length >= 12 ? "12 reels already uploaded" : "Add reel"}
            </button>
            {message && <p className="mt-3 text-sm text-stone-600">{message}</p>}
          </div>
        </form>
      </PageCard>

      <PageCard>
        {loading ? <p className="text-sm text-stone-500">Loading posts...</p> : posts.length === 0 ? <p className="text-sm text-stone-500">No uploaded posts yet.</p> : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {posts.map((post) => (
              <div key={post.id} className="overflow-hidden rounded-xl border border-[#eadfd3] bg-white">
                <img src={resolveImageUrl(post.image)} alt={post.caption || "Instagram post"} className="aspect-[9/16] w-full object-contain" />
                <div className="p-3">
                  <button type="button" disabled={saving} onClick={() => removePost(post.id)} className="mt-2 text-xs font-semibold text-red-600 underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  );
}
