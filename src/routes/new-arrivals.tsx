import { createFileRoute } from "@tanstack/react-router";
import { AppShell, CatalogPage } from "@/components/commerce";
export const Route = createFileRoute("/new-arrivals")({
  component: () => (
    <AppShell>
      <CatalogPage title="Just In" filter={(p) => p.tags.includes("new")} />
    </AppShell>
  ),
});
