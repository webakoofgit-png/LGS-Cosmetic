import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, InfoPage, type InfoPageKey } from "@/components/commerce";

const validPages = new Set<InfoPageKey>([
  "about",
  "gallery",
  "faqs",
  "shipping-information",
  "return-policy",
  "privacy-policy",
  "terms-and-conditions",
]);
export const Route = createFileRoute("/$info")({ component: Page });
function Page() {
  const { info } = Route.useParams();
  if (!validPages.has(info as InfoPageKey)) throw notFound();
  return (
    <AppShell>
      <InfoPage page={info as InfoPageKey} />
    </AppShell>
  );
}
