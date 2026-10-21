import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero } from "@/components/commerce";
import { ADMIN_API_BASE, resolveImageUrl } from "@/lib/admin-api";

type Blog = {
  id: number;
  title: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  author?: string;
  status: string;
};

export const Route = createFileRoute("/blog")({ component: BlogPage });

function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const posts: Blog[] = [];
        for (let page = 1; ; page++) {
          const response = await fetch(`${ADMIN_API_BASE}/api/blogs?limit=100&page=${page}`, {
            signal: controller.signal,
          });
          if (!response.ok) throw new Error("Unable to load blogs");
          const payload = await response.json();
          if (!Array.isArray(payload.data)) throw new Error("Invalid blog response");
          posts.push(...payload.data);
          if (page >= (payload.pagination?.totalPages ?? 1)) break;
        }
        // Render editor HTML as plain text so article content cannot execute scripts.
        const plainText = (value: string) =>
          new DOMParser().parseFromString(value, "text/html").body.textContent ?? "";
        setBlogs(posts.filter((post) => post.status === "Published").map((post) => ({
          ...post,
          excerpt: plainText(post.excerpt ?? ""),
          content: plainText(post.content ?? ""),
        })));
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  return (
    <AppShell>
      <PageHero title="LGS Cosmetics Blog" copy="Beauty tips, skin and hair care advice, and news from LGS Cosmetics." />
      <section aria-label="Blog articles" className="container-lv py-14">
        {loading ? <p role="status">Loading articles…</p> : error ? (
          <p role="alert">Unable to load articles. Please refresh the page to try again.</p>
        ) : blogs.length === 0 ? <p>Beauty stories are coming soon. Check back for our latest articles.</p> : (
          <div className="grid items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article key={blog.id} className="overflow-hidden border bg-white">
                {blog.featuredImage && <img src={resolveImageUrl(blog.featuredImage)} alt={blog.title} loading="lazy" className="aspect-video w-full object-cover" />}
                <div className="space-y-4 p-6">
                  <h2 className="text-2xl text-wine">{blog.title}</h2>
                  {blog.author && <p className="text-sm text-muted-foreground">By {blog.author}</p>}
                  <p className="leading-7 text-muted-foreground">{blog.excerpt}</p>
                  {blog.content && <details>
                    <summary className="cursor-pointer font-semibold text-wine">Read article</summary>
                    <p className="mt-4 whitespace-pre-line leading-7">{blog.content}</p>
                  </details>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
