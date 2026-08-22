import { createFileRoute } from "@tanstack/react-router";
import { AppShell, CatalogPage } from "@/components/commerce";
export const Route = createFileRoute("/offers")({
  component: () => (
    <AppShell>
      <CatalogPage title="Beauty Offers You'll Love" filter={(p) => p.tags.includes("offer")} />
    </AppShell>
  ),
});
