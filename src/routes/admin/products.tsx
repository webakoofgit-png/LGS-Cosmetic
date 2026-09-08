import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAdminToken } from "@/lib/admin-session";

export const Route = createFileRoute("/admin/products")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAdminToken()) throw redirect({ to: "/admin/login" });
  },
  component: () => <Outlet />,
});
