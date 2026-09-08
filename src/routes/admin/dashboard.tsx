import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardPage } from "@/components/admin/admin-page";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminToken } from "@/lib/admin-session";

export const Route = createFileRoute("/admin/dashboard")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAdminToken()) throw redirect({ to: "/admin/login" });
  },
  component: () => (
    <AdminShell>
      <DashboardPage />
    </AdminShell>
  ),
});
