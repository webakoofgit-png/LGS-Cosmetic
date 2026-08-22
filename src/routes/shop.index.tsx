import { createFileRoute } from "@tanstack/react-router";
import { AppShell, CatalogPage } from "@/components/commerce";
export const Route = createFileRoute("/shop/")({
  component: () => (
    <AppShell>
      <CatalogPage />
    </AppShell>
  ),
});
