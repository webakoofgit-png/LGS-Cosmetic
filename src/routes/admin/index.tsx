import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAdminToken } from "@/lib/admin-session";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (getAdminToken()) throw redirect({ to: "/admin/dashboard" });
    throw redirect({ to: "/admin/login" });
  },
});
