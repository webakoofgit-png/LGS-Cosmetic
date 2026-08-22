import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, ProductPage } from "@/components/commerce";
import { productBySlug } from "@/data/catalog";
export const Route = createFileRoute("/product/$slug")({ component: Page });
function Page() {
  const { slug } = Route.useParams();
  const p = productBySlug(slug);
  if (!p) throw notFound();
  return (
    <AppShell>
      <ProductPage product={p} />
    </AppShell>
  );
}
