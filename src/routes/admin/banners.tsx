import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSection } from "@/components/admin/admin-section";
import { getAdminToken } from "@/lib/admin-session";

export const Route = createFileRoute("/admin/banners")({
  beforeLoad: () => { if (typeof window !== "undefined" && !getAdminToken()) throw redirect({ to: "/admin/login" }); },
  component: () => <AdminShell><AdminSection section="banners" /></AdminShell>,
});
