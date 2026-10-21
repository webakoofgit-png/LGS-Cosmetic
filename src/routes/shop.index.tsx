import { createFileRoute } from "@tanstack/react-router";
import { AppShell, CatalogPage } from "@/components/commerce";
import { beautyNeeds, matchesBeautyNeed } from "@/data/catalog";
export const Route = createFileRoute("/shop/")({
  validateSearch: (search: Record<string, unknown>): { need?: string } =>
    typeof search["need"] === "string" && beautyNeeds.some((item) => item.slug === search["need"])
      ? { need: search["need"] }
      : {},
  component: ShopPage,
});

function ShopPage() {
  const { need } = Route.useSearch();
  const group = beautyNeeds.find((item) => item.slug === need);
  return (
    <AppShell>
      {group ? <CatalogPage key={group.slug} title={group.title} filter={(product) => matchesBeautyNeed(product, group.slug)} /> : <CatalogPage />}
    </AppShell>
  );
}
