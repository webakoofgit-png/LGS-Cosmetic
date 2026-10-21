import { createFileRoute } from "@tanstack/react-router";
import { AppShell, CatalogPage } from "@/components/commerce";
import { useStoreCategories } from "@/lib/store-categories";
export const Route = createFileRoute("/shop/$category")({ component: Page });
function Page() {
  const { category } = Route.useParams();
  return (
    <AppShell>
      <CategoryContent category={category} />
    </AppShell>
  );
}

function CategoryContent({ category }: { category: string }) {
  const { data: categories = [] } = useStoreCategories();
  const current = categories.find((item) => item.slug === category);
  return <CatalogPage title={current?.name ?? "Beauty Collection"} filter={(product) => product.category === category} />;
}
