import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_layout")({
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
