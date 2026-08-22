import { createFileRoute } from "@tanstack/react-router";
import { AppShell, CatalogPage } from "@/components/commerce";
import { categoryBySlug } from "@/data/catalog";
export const Route = createFileRoute("/shop/$category")({ component: Page });
function Page() {
  const { category } = Route.useParams();
  const c = categoryBySlug(category);
  return (
    <AppShell>
      <CatalogPage title={c?.name ?? "Beauty Collection"} filter={(p) => p.category === category} />
    </AppShell>
  );
}
