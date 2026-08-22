import { createFileRoute } from "@tanstack/react-router";
import { AppShell, CatalogPage } from "@/components/commerce";
export const Route = createFileRoute("/best-sellers")({
  component: () => (
    <AppShell>
      <CatalogPage title="Our Best Sellers" filter={(p) => p.tags.includes("bestseller")} />
    </AppShell>
  ),
});
