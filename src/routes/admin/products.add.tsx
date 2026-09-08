import { createFileRoute, useRouter, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader, AdminShell, PageCard } from "@/components/admin/admin-shell";
import { ADMIN_API_BASE, resolveImageUrl } from "@/lib/admin-api";
import { getAdminToken } from "@/lib/admin-session";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type ProductFormState = {
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  type: string;
  subtitle: string;
  sku: string;
  shortDescription: string;
  description: string;
  ingredients: string;
  benefits: string;
  usage: string;
  size: string;
  tags: string;
  variants: string;
  price: string;
  salePrice: string;
  stock: string;
  status: "Active" | "Inactive";
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
  mainImage: File | null;
  galleryImages: File[];
  additionalImages: string;
};

type VariantDraft = { size: string; unit: string; price: string; mrp: string };

const initialState: ProductFormState = {
  name: "",
  slug: "",
  brand: "",
  categoryId: "",
  type: "",
  subtitle: "",
  sku: "",
  shortDescription: "",
  description: "",
  ingredients: "",
  benefits: "",
  usage: "",
  size: "",
  tags: "",
  variants: "",
  price: "",
  salePrice: "",
  stock: "",
  status: "Active",
  featured: false,
  metaTitle: "",
  metaDescription: "",
  mainImage: null,
  galleryImages: [],
  additionalImages: "",
};

export const Route = createFileRoute("/admin/products/add")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
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
  const router = useRouter();
  const token = getAdminToken();
  const { id } = Route.useSearch();
  const [form, setForm] = useState<ProductFormState>(initialState);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [variantRows, setVariantRows] = useState<VariantDraft[]>([]);
  const [imagePreview, setImagePreview] = useState("");
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const isEditing = Boolean(id);

  const slugPreview = useMemo(() => slugify(form.name), [form.name]);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const response = await fetch(`${ADMIN_API_BASE}/api/product-categories?limit=100`);
        const data = await response.json();
        if (!active) return;
        setCategories(Array.isArray(data?.data) ? data.data : []);
      } catch {
        if (active) setCategories([]);
      } finally {
        if (active) setLoadingCategories(false);
      }
    }

    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!id) return;

    async function loadProduct() {
      try {
        setLoadingProduct(true);
        const response = await fetch(`${ADMIN_API_BASE}/api/products/${id}`);
        const data = await response.json();
        if (!active) return;
        const product = data?.data;
        if (!product) throw new Error("Product not found.");
        setForm({
          name: product.name ?? "",
          slug: product.slug ?? "",
          brand: product.brand ?? "",
          categoryId: product.categoryId ? String(product.categoryId) : "",
          type: product.type ?? "",
          subtitle: product.subtitle ?? "",
          sku: product.sku ?? "",
          shortDescription: product.shortDescription ?? "",
          description: product.description ?? "",
          ingredients: product.ingredients ?? "",
          benefits: product.benefits ?? "",
          usage: product.usage ?? "",
          size: product.size ?? "",
          tags: normalizeList(product.tags),
          variants: normalizeJson(product.variants),
          price: product.price?.toString?.() ?? "",
          salePrice: product.salePrice?.toString?.() ?? "",
          stock: product.stock?.toString?.() ?? "",
          status: product.status === "Inactive" ? "Inactive" : "Active",
          featured: Boolean(product.featured),
          metaTitle: product.metaTitle ?? "",
          metaDescription: product.metaDescription ?? "",
          mainImage: null,
          galleryImages: [],
          additionalImages: normalizeList(product.additionalImages),
        });
        if (product.mainImage) setImagePreview(resolveImageUrl(String(product.mainImage)));
        setGalleryPreview(parseList(normalizeList(product.additionalImages)).map((image) => resolveImageUrl(image)));
        setVariantRows(parseVariantRows(product.variants));
        setSlugTouched(true);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load product.");
      } finally {
        if (active) setLoadingProduct(false);
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!slugTouched && !isEditing) {
      setForm((current) => ({
        ...current,
        slug: slugPreview,
      }));
    }
  }, [slugPreview, slugTouched, isEditing]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (!token) {
        throw new Error("Admin session expired. Please login again.");
      }

      const firstVariant = variantRows.find((variant) => variant.size.trim() && variant.price.trim());
      const basePrice = form.price.trim() || firstVariant?.mrp.trim() || firstVariant?.price.trim() || "";
      if (!form.name.trim() || !form.slug.trim() || !form.categoryId || !basePrice) {
        throw new Error("Please fill Product Name, Slug, Category and at least one variant price.");
      }

      const body = new FormData();
      body.append("name", form.name.trim());
      body.append("slug", form.slug.trim());
      body.append("brand", form.brand.trim());
      body.append("categoryId", form.categoryId);
      body.append("type", form.type.trim());
      body.append("subtitle", form.subtitle.trim());
      body.append("sku", form.sku.trim());
      body.append("shortDescription", form.shortDescription.trim());
      body.append("description", form.description.trim());
      body.append("ingredients", form.ingredients.trim());
      body.append("benefits", form.benefits.trim());
      body.append("usage", form.usage.trim());
      body.append("size", form.size.trim());
      body.append("metaTitle", form.metaTitle.trim());
      body.append("metaDescription", form.metaDescription.trim());
      body.append("price", basePrice);
      body.append("salePrice", form.salePrice.trim() || firstVariant?.price.trim() || basePrice);
      body.append("stock", form.stock.trim() || "0");
      body.append("status", form.status);
      body.append("featured", String(form.featured));
      body.append("tags", JSON.stringify(parseList(form.tags)));
      body.append(
        "variants",
        JSON.stringify(
          variantRows
            .filter((variant) => variant.size.trim() && variant.price.trim())
            .map((variant) => ({
              label: `${variant.size.trim()} ${variant.unit}`.trim(),
              size: `${variant.size.trim()} ${variant.unit}`.trim(),
              price: Number(variant.price),
              ...(variant.mrp.trim() ? { mrp: Number(variant.mrp) } : {}),
            })),
        ),
      );
      body.append("additionalImages", JSON.stringify(parseList(form.additionalImages)));

      if (form.mainImage) {
        body.append("mainImage", form.mainImage);
      }
      form.galleryImages.forEach((file) => body.append("galleryImages", file));

      const response = await fetch(`${ADMIN_API_BASE}/api/products${isEditing ? `/${id}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to save product.");
      }

      setSuccess(isEditing ? "Product updated successfully." : "Product added successfully.");
      setForm(initialState);
      setVariantRows([]);
      setSlugTouched(false);
      router.navigate({ to: "/admin/products" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={isEditing ? "Edit Product" : "Add Product"}
        sub={
          isEditing
            ? "Update the product details, SEO, variants and images."
            : "Create a cosmetics product with SEO, variants and images."
        }
      />

      <form className="grid gap-6" onSubmit={handleSubmit}>
        {loadingProduct ? (
          <PageCard>
            <p className="text-sm text-stone-500">Loading product data…</p>
          </PageCard>
        ) : null}
        <div className="grid gap-6">
          <PageCard>
            <SectionTitle title="Basic Information" copy="Core product details visible across the store." />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField
                label="Product Name *"
                value={form.name}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    name: value,
                    slug: slugTouched ? current.slug : slugify(value),
                  }))
                }
              />
              <TextField
                label="Slug *"
                value={form.slug}
                onChange={(value) => {
                  setSlugTouched(true);
                  setForm((current) => ({ ...current, slug: value }));
                }}
              />
              <TextField
                label="Brand"
                value={form.brand}
                onChange={(value) => setForm((current) => ({ ...current, brand: value }))}
              />
              <SelectField
                label="Category *"
                value={form.categoryId}
                onChange={(value) => setForm((current) => ({ ...current, categoryId: value }))}
                options={[
                  { value: "", label: loadingCategories ? "Loading categories..." : "Select category" },
                  ...categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  })),
                ]}
              />
              <TextField
                label="Product Type"
                value={form.type}
                onChange={(value) => setForm((current) => ({ ...current, type: value }))}
                placeholder="Foundation, lipstick, serum, etc."
              />
              <TextField
                label="SKU"
                value={form.sku}
                onChange={(value) => setForm((current) => ({ ...current, sku: value }))}
              />
            </div>
            <div className="mt-4 grid gap-4">
              <TextAreaField
                label="Subtitle / Tagline"
                rows={2}
                value={form.subtitle}
                onChange={(value) => setForm((current) => ({ ...current, subtitle: value }))}
              />
              <TextAreaField
                label="Short Description"
                rows={3}
                value={form.shortDescription}
                onChange={(value) => setForm((current) => ({ ...current, shortDescription: value }))}
              />
              <TextAreaField
                label="Full Description"
                rows={6}
                value={form.description}
                onChange={(value) => setForm((current) => ({ ...current, description: value }))}
              />
            </div>
          </PageCard>

          <PageCard>
            <SectionTitle title="SEO" copy="Search engine and social sharing metadata." />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField
                label="Meta Title"
                value={form.metaTitle}
                onChange={(value) => setForm((current) => ({ ...current, metaTitle: value }))}
              />
              <TextField
                label="Meta Description"
                value={form.metaDescription}
                onChange={(value) => setForm((current) => ({ ...current, metaDescription: value }))}
              />
              <TextField
                label="Tags"
                value={form.tags}
                onChange={(value) => setForm((current) => ({ ...current, tags: value }))}
                placeholder="lipstick, matte, long lasting"
              />
            </div>
            <VariantBuilder rows={variantRows} onChange={setVariantRows} />
            <div className="mt-4 max-w-sm">
              <TextField
                label="Stock Quantity"
                type="number"
                value={form.stock}
                onChange={(value) => setForm((current) => ({ ...current, stock: value }))}
                placeholder="Available units"
              />
            </div>
          </PageCard>
        </div>

        <div className="grid gap-6 content-start">
          <PageCard>
            <SectionTitle title="Images" copy="Upload the main image and store gallery image URLs." />
            <div className="mt-4 grid gap-4">
              <FileField
                label="Main Image *"
                accept="image/png,image/jpeg,image/webp"
                onChange={(file) => {
                  setForm((current) => ({ ...current, mainImage: file }));
                  setImagePreview(file ? URL.createObjectURL(file) : "");
                }}
              />
              {imagePreview && <div className="rounded-xl border border-[#eadfd3] bg-stone-50 p-3"><p className="mb-2 text-xs font-semibold text-stone-600">Image preview</p><img src={imagePreview} alt="Product preview" className="h-44 w-full rounded-lg object-contain" /></div>}
              <label className="grid gap-1.5 text-sm font-medium text-stone-700">Gallery Images (up to 4 additional views)
                <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => { const files = Array.from(event.target.files ?? []).slice(0, 4); setForm((current) => ({ ...current, galleryImages: files })); setGalleryPreview(files.map((file) => URL.createObjectURL(file))); }} className="rounded-xl border border-[#ddd2c5] px-3 py-2 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-[#f5e6e6] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#7f1d1d]" />
              </label>
              {galleryPreview.length > 0 && <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{galleryPreview.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`Gallery preview ${index + 1}`} className="h-24 w-full rounded-lg border object-cover" />)}</div>}
              <TextAreaField
                label="Additional Image URLs"
                rows={4}
                value={form.additionalImages}
                onChange={(value) => setForm((current) => ({ ...current, additionalImages: value }))}
                placeholder="Paste one image URL per line"
              />
            </div>
          </PageCard>

          <PageCard>
            <SectionTitle title="Visibility" copy="Choose how the product appears on the storefront." />
            <div className="mt-4 grid gap-3 text-sm">
              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) =>
                  setForm((current) => ({ ...current, status: value === "Inactive" ? "Inactive" : "Active" }))
                }
                options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]}
              />
              <label className="flex items-center gap-3 rounded-xl border border-[#eadfd3] px-3 py-2">
                <input
                  type="checkbox"
                  className="size-4 accent-[#7f1d1d]"
                  checked={form.featured}
                  onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
                />
                Featured product
              </label>
              <p className="text-xs text-stone-500">
                Active status controls listing visibility. Featured products can be highlighted on the homepage.
              </p>
            </div>
          </PageCard>

        </div>

        <div>
          {error && <p className="mb-3 text-sm font-medium text-red-600">{error}</p>}
          {success && <p className="mb-3 text-sm font-medium text-emerald-700">{success}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              disabled={saving}
              className="rounded-xl bg-[#7f1d1d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#651717] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
            <button
              type="button"
              onClick={() => router.navigate({ to: "/admin/products" })}
              className="rounded-xl border border-[#ddd2c5] px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-stone-500">{copy}</p>
    </div>
  );
}

function VariantBuilder({ rows, onChange }: { rows: VariantDraft[]; onChange: (rows: VariantDraft[]) => void }) {
  const update = (index: number, key: keyof VariantDraft, value: string) => {
    onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  };
  return (
    <div className="mt-4 rounded-xl border border-[#eadfd3] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-stone-800">Size variants</h4>
          <p className="mt-1 text-xs text-stone-500">Add multiple sizes such as 50 gm, 100 ml and set a price for each.</p>
        </div>
        <button type="button" onClick={() => onChange([...rows, { size: "", unit: "gm", price: "", mrp: "" }])} className="rounded-lg bg-[#7f1d1d] px-3 py-2 text-xs font-semibold text-white">
          + Add size
        </button>
      </div>
      {rows.length === 0 ? <p className="mt-3 text-xs text-stone-500">No variants added. Use the button to add size-wise pricing.</p> : (
        <div className="mt-3 grid gap-3">
          {rows.map((row, index) => (
            <div key={index} className="grid gap-2 rounded-lg bg-stone-50 p-3 sm:grid-cols-[1fr_120px_1fr_1fr_auto]">
              <input aria-label="Size" value={row.size} onChange={(event) => update(index, "size", event.target.value)} placeholder="100" className="h-10 rounded-lg border border-[#ddd2c5] px-3 text-sm" />
              <select aria-label="Unit" value={row.unit} onChange={(event) => update(index, "unit", event.target.value)} className="h-10 rounded-lg border border-[#ddd2c5] px-2 text-sm">
                {['gm', 'kg', 'ml', 'l', 'oz', 'pcs'].map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
              <input aria-label="Variant MRP" type="number" min="0" value={row.mrp} onChange={(event) => update(index, "mrp", event.target.value)} placeholder="MRP (optional)" className="h-10 rounded-lg border border-[#ddd2c5] px-3 text-sm" />
              <input aria-label="Variant price" type="number" min="0" value={row.price} onChange={(event) => update(index, "price", event.target.value)} placeholder="Selling price *" className="h-10 rounded-lg border border-[#ddd2c5] px-3 text-sm" />
              <button type="button" aria-label="Remove size" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))} className="h-10 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function parseVariantRows(value: unknown): VariantDraft[] {
  let parsed = value;
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return []; }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.map((item) => {
    const raw = String(item?.size ?? item?.label ?? "").trim();
    const match = raw.match(/^(.*?)(?:\s+)(gm|kg|ml|l|oz|pcs)$/i);
    return {
      size: match ? match[1] : raw,
      unit: match ? match[2].toLowerCase() : "gm",
      price: item?.price == null ? "" : String(item.price),
      mrp: item?.mrp == null ? "" : String(item.mrp),
    };
  }).filter((item) => item.size);
}

function TextField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-stone-700">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-[#ddd2c5] px-3 outline-none transition focus:border-[#7f1d1d]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-stone-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-[#ddd2c5] px-3 outline-none transition focus:border-[#7f1d1d]"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  rows = 4,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-stone-700">
      {label}
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[#ddd2c5] px-3 py-2 outline-none transition focus:border-[#7f1d1d]"
      />
    </label>
  );
}

function FileField({
  label,
  accept,
  onChange,
}: {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-stone-700">
      {label}
      <input
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="rounded-xl border border-[#ddd2c5] px-3 py-2 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-[#f5e6e6] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#7f1d1d]"
      />
    </label>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeList(value: unknown) {
  if (Array.isArray(value)) return value.join("\n");
  if (typeof value === "string") return value;
  return "";
}

function normalizeJson(value: unknown) {
  if (Array.isArray(value) || (value && typeof value === "object")) {
    try {
      return JSON.stringify(value);
    } catch {
      return "[]";
    }
  }
  if (typeof value === "string" && value.trim()) return value;
  return "[]";
}

function parseList(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Fall back to the friendly one-item-per-line format below.
  }
  return trimmed
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}
