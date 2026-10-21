import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/commerce";
import { CustomerOrderPage } from "@/components/customer-order";

export const Route = createFileRoute("/orders/$number")({ component: Page });
function Page() {
  const { number } = Route.useParams();
  return <AppShell><CustomerOrderPage orderNumber={number} /></AppShell>;
}
