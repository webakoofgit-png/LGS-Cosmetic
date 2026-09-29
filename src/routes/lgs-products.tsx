import { createFileRoute } from "@tanstack/react-router";
import { AppShell, CatalogPage } from "@/components/commerce";
export const Route = createFileRoute("/lgs-products")({
  component: () => (
    <AppShell>
      <CatalogPage title="Discover LGS" adminOnly filter={(p) => p.brand.trim().toLowerCase() === "lgs" || p.category === "lgs-products"} />
    </AppShell>
  ),
});
