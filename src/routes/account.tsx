import { createFileRoute } from "@tanstack/react-router";
import { AccountPage, AppShell } from "@/components/commerce";
export const Route = createFileRoute("/account")({
  component: () => (
    <AppShell>
      <AccountPage />
    </AppShell>
  ),
});
