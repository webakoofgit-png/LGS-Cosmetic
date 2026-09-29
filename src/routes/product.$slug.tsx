import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, ProductPage } from "@/components/commerce";
import { useShop } from "@/lib/shop-store";
export const Route = createFileRoute("/product/$slug")({ component: Page });
function Page() {
  return <AppShell><ProductDetails /></AppShell>;
}
function ProductDetails() {
  const { slug } = Route.useParams();
  const { catalogProducts } = useShop();
  const p = catalogProducts.find((product) => product.slug === slug);
  if (!p) throw notFound();
  return (
      <ProductPage product={p} />
  );
}
