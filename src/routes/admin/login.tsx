import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLoginPage } from "@/components/admin/admin-login";
import { getAdminToken } from "@/lib/admin-session";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && getAdminToken()) throw redirect({ to: "/admin/dashboard" });
  },
  component: AdminLoginPage,
});
