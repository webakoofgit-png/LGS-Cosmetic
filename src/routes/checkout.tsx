import { createFileRoute } from "@tanstack/react-router";
import { AppShell, CheckoutPage } from "@/components/commerce";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout | LGS Cosmetics" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <AppShell>
      <CheckoutPage />
    </AppShell>
  ),
});
