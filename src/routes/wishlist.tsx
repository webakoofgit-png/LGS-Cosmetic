import { createFileRoute } from "@tanstack/react-router";
import { AppShell, WishlistPage } from "@/components/commerce";
export const Route = createFileRoute("/wishlist")({
  component: () => (
    <AppShell>
      <WishlistPage />
    </AppShell>
  ),
});
