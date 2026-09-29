import { createFileRoute } from "@tanstack/react-router";
import { AppShell, CatalogPage, PageHero } from "@/components/commerce";
import { whatsappUrl } from "@/data/site";
export const Route = createFileRoute("/for-salons")({ component: Page });
function Page() {
  return (
    <AppShell>
      <PageHero
        title="Professional Beauty Solutions for Your Salon"
        copy="Equipment, professional products and wholesale solutions from a trusted local supplier."
      />
      <CatalogPage
        title="Salon Equipment & Supplies"
        filter={(p) => p.category === "salon-essentials"}
      />
      <section className="bg-wine-deep py-16 text-white">
        <div className="container-lv grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow !text-gold">WHOLESALE ENQUIRY</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Let's grow your salon together.</h2>
            <p className="mt-5 text-sm leading-7 text-white/65">
              Tell us what you need and our store team will contact you with availability and
              pricing.
            </p>
            <a
              href={whatsappUrl}
              className="mt-7 inline-block border border-gold px-6 py-4 text-xs font-bold text-gold"
            >
              WHATSAPP FOR QUICK ENQUIRY
            </a>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="grid gap-3 sm:grid-cols-2">
            {[
              "Full Name",
              "Salon / Business Name",
              "Phone Number",
              "WhatsApp Number",
              "Location",
              "Product Interested In",
              "Approximate Quantity",
            ].map((x) => (
              <input
                key={x}
                placeholder={x}
                className="h-12 bg-white px-4 text-sm text-charcoal outline-none"
              />
            ))}
            <textarea
              placeholder="Message"
              className="min-h-28 bg-white p-4 text-sm text-charcoal outline-none sm:col-span-2"
            />
            <button className="h-13 bg-gold text-xs font-bold text-wine-deep sm:col-span-2">
              REQUEST WHOLESALE QUOTE
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
