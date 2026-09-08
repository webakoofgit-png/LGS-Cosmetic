import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ADMIN_API_BASE, resolveImageUrl } from "@/lib/admin-api";
import { products as catalogProducts } from "@/data/catalog";
import { AdminPageHeader, AdminShell, PageCard } from "@/components/admin/admin-shell";
import { getAdminToken } from "@/lib/admin-session";

type Product = {
  id: number;
  name: string;
  slug: string;
  brand?: string | null;
  mainImage?: string | null;
  type?: string | null;
  price?: string | number | null;
  salePrice?: string | number | null;
  stock?: number | null;
  status?: string | null;
  featured?: boolean | null;
  createdAt?: string;
  category?: { name?: string | null };
};

export const Route = createFileRoute("/admin/products/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAdminToken()) throw redirect({ to: "/admin/login" });
  },
  component: () => (
    <AdminShell>
      <Page />
    </AdminShell>
  ),
});

function Page() {
  const token = getAdminToken();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
    [products],
  );

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${ADMIN_API_BASE}/api/products?limit=100`);
        const data = await response.json();
        if (!active) return;
        setProducts(Array.isArray(data?.data) ? data.data : []);
      } catch {
        if (active) setError("Unable to load products right now.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(productId: number) {
    if (!token) return;
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;

    try {
      setDeletingId(productId);
      const response = await fetch(`${ADMIN_API_BASE}/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to delete product.");
      setProducts((current) => current.filter((product) => product.id !== productId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Products"
        sub="Manage product catalog and visibility."
        action={
          <Link
            to="/admin/products/add"
            className="rounded-xl bg-[#7f1d1d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#651717]"
          >
            + Add Product
          </Link>
        }
      />
      <PageCard>
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-stone-600">
          <span className="rounded-full bg-stone-100 px-3 py-1">Total products: {products.length}</span>
          <span className="rounded-full bg-stone-100 px-3 py-1">Total stock: {totalStock}</span>
        </div>

        {error && <p className="mb-4 text-sm font-medium text-red-600">{error}</p>}

        {loading ? (
          <div className="grid min-h-64 place-items-center text-center">
            <p className="text-sm text-stone-500">Loading products…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="grid min-h-64 place-items-center text-center">
            <div>
              <h3 className="text-xl font-semibold">No products yet</h3>
              <p className="mt-2 text-sm text-stone-500">Add your first cosmetic product from the button above.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-400">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="rounded-xl bg-white shadow-[0_0_0_1px_rgba(234,223,211,1)]">
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        {product.mainImage ? <img src={resolveProductImage(product)} alt="" className="size-12 rounded-lg border border-[#eadfd3] object-cover" /> : <div className="grid size-12 place-items-center rounded-lg bg-stone-100 text-[10px] text-stone-400">No image</div>}
                        <div className="font-semibold text-stone-900">{product.name}</div>
                      </div>
                      <div className="text-xs text-stone-500">{product.brand || product.slug}</div>
                    </td>
                    <td className="px-3 py-4 text-sm text-stone-700">{product.category?.name || "—"}</td>
                    <td className="px-3 py-4 text-sm text-stone-700">{formatCurrency(product.salePrice ?? product.price)}</td>
                    <td className="px-3 py-4 text-sm text-stone-700">{product.stock ?? 0}</td>
                    <td className="px-3 py-4">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          product.status === "Inactive"
                            ? "bg-stone-100 text-stone-600"
                            : "bg-emerald-50 text-emerald-700",
                        ].join(" ")}
                      >
                        {product.status || "Active"}
                        {product.featured ? " • Featured" : ""}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to="/admin/products/add"
                          search={{ id: String(product.id) }}
                          className="rounded-lg border border-[#ddd2c5] px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {deletingId === product.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>
    </div>
  );
}

function resolveProductImage(product: Product) {
  if (product.mainImage && !product.mainImage.startsWith("/assets/")) return resolveImageUrl(product.mainImage);
  return catalogProducts.find((item) => item.slug === product.slug)?.image || "";
}

function formatCurrency(value: string | number | null | undefined) {
  const amount = Number(value || 0);
  if (Number.isNaN(amount)) return "—";
  return `₹${amount.toFixed(2)}`;
}
