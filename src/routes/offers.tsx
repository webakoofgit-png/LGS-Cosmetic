import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, TicketPercent, ArrowRight } from "lucide-react";
import { AppShell, PageHero, ProductCard } from "@/components/commerce";
import { customerRequest } from "@/lib/customer-api";
import { useShop } from "@/lib/shop-store";
import { formatINR } from "@/data/site";

type Coupon = { code: string; discountType: string; discountValue: string | number; minOrderAmount: string | number; maxDiscount: string | number | null; expiresAt: string | null };

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [{ title: "Offers & Coupons | LGS Cosmetics" }] }),
  component: () => (
    <AppShell>
      <OffersPage />
    </AppShell>
  ),
});

function OffersPage() {
  const { adminProducts, catalogError } = useShop();
  const [copied, setCopied] = useState("");
  const [copyError, setCopyError] = useState("");
  const [sort, setSort] = useState("featured");
  const coupons = useQuery({ queryKey: ["available-coupons"], queryFn: () => customerRequest<{ data: Coupon[] }>("/api/coupons/available"), staleTime: 0, refetchInterval: 60_000 });
  const products = adminProducts.filter(product => product.mrp > product.price).sort((a, b) => sort === "price" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0);

  async function copyCode(code: string) {
    setCopyError(""); setCopied("");
    try { await navigator.clipboard.writeText(code); setCopied(code); }
    catch { setCopyError("Unable to copy automatically. Select the coupon code and copy it to use at checkout."); }
  }

  return <>
    <PageHero title="Offers & Coupons" copy="Save more on your beauty favourites." />
    <div className="container-lv space-y-14 py-10 sm:py-14">
      <section aria-labelledby="coupon-heading">
        <div className="mb-6"><h2 id="coupon-heading" className="text-3xl text-wine sm:text-4xl">Available Coupons</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Copy a code and apply it at checkout. One coupon can be used per order.</p></div>
        {copyError && <p role="alert" className="mb-4 text-sm text-wine">{copyError}</p>}
        <p role="status" className="sr-only">{copied ? `${copied} copied to clipboard.` : ""}</p>
        {coupons.isPending ? <p role="status" className="border bg-white p-6 text-sm">Loading offers...</p> : coupons.isError ? <div className="border bg-white p-6 text-sm"><p role="alert">Unable to load coupons.</p><button type="button" onClick={() => coupons.refetch()} className="mt-3 min-h-11 text-wine underline">Try again</button></div> : !coupons.data?.data.length ? <div className="rounded-xl border border-wine/10 bg-white p-7 text-sm leading-7 text-muted-foreground">No coupons available right now. Check back for new offers.</div> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{coupons.data.data.map(coupon => <article key={coupon.code} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-wine/20 bg-white">
          <div className="bg-secondary p-5"><TicketPercent size={26} className="mb-4 text-wine" aria-hidden="true" /><h3 className="text-3xl text-wine">{coupon.discountType === "fixed" ? formatINR(Number(coupon.discountValue)) : `${Number(coupon.discountValue)}%`} OFF</h3><p className="mt-2 text-sm">{Number(coupon.minOrderAmount) > 0 ? `On orders of ${formatINR(Number(coupon.minOrderAmount))} or more` : "No minimum order"}</p></div>
          <div className="flex flex-1 flex-col p-5"><p className="select-all break-all rounded border border-dashed border-wine/40 bg-ivory px-4 py-3 text-center font-bold tracking-wider text-wine">{coupon.code}</p><div className="mt-3 flex-1 space-y-1 text-xs leading-6 text-muted-foreground">{coupon.maxDiscount != null && <p>Maximum discount: {formatINR(Number(coupon.maxDiscount))}</p>}{coupon.expiresAt && <p>Expires: {new Date(coupon.expiresAt).toLocaleDateString("en-IN")}</p>}</div><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => void copyCode(coupon.code)} aria-label={`Copy coupon code ${coupon.code}`} className="inline-flex min-h-11 items-center justify-center gap-2 border border-wine px-3 text-xs font-semibold text-wine">{copied === coupon.code ? <Check size={15} /> : <Copy size={15} />}{copied === coupon.code ? "Copied!" : "Copy Code"}</button><a href="/shop" className="inline-flex min-h-11 items-center justify-center gap-2 bg-wine px-3 text-xs font-semibold text-white">Shop Now <ArrowRight size={15} /></a></div></div>
        </article>)}</div>}
      </section>
      <section aria-labelledby="product-offers-heading"><div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-5"><div><h2 id="product-offers-heading" className="text-3xl text-wine sm:text-4xl">Products on Offer</h2><p className="mt-3 text-sm text-muted-foreground">Beauty favourites at reduced prices.</p></div>{products.length > 0 && <select aria-label="Sort offer products" value={sort} onChange={event => setSort(event.target.value)} className="min-h-11 border bg-white px-3 text-sm"><option value="featured">Featured</option><option value="price">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select>}</div>
        {catalogError ? <p role="alert" className="py-7 text-sm text-muted-foreground">Unable to load product offers. Please refresh the page.</p> : products.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{products.map(product => <ProductCard key={product.id} p={product} />)}</div> : <div className="rounded-xl border border-wine/10 bg-white p-7 text-sm leading-7"><p className="text-muted-foreground">No product offers available right now. Explore our full collection for your next beauty favourite.</p><a href="/shop" className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-wine">Explore products <ArrowRight size={16} /></a></div>}
      </section>
    </div>
  </>;
}
