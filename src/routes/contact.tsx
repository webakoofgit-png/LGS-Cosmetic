import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero } from "@/components/commerce";
import { mapsUrl, site, whatsappUrl } from "@/data/site";
export const Route = createFileRoute("/contact")({
  component: () => (
    <AppShell>
      <PageHero
        title="Visit Our Beauty Mall"
        copy="We would love to help you find your next beauty favourite."
      />
      <section className="container-lv grid gap-8 py-14 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl text-wine">Lucky Varieties Beauty Mall</h2>
          <p className="mt-5 leading-8 text-muted-foreground">
            {site.address.line1}
            <br />
            {site.address.line2}
          </p>
          <p className="mt-5 leading-8">
            {site.phones.map((phone, index) => (
              <span key={phone} className="block">
                <a href={`tel:${phone}`}>{site.phonesDisplay[index]}</a>
              </span>
            ))}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={mapsUrl} className="bg-wine px-5 py-4 text-xs font-bold text-white">
              GET DIRECTIONS
            </a>
            <a
              href={whatsappUrl}
              className="border border-wine px-5 py-4 text-xs font-bold text-wine"
            >
              WHATSAPP US
            </a>
          </div>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-3 bg-white p-6">
          <input placeholder="Your name" className="h-12 w-full border px-4" />
          <input placeholder="Phone number" className="h-12 w-full border px-4" />
          <textarea placeholder="How can we help?" className="min-h-32 w-full border p-4" />
          <button className="h-12 w-full bg-wine text-xs font-bold text-white">SEND ENQUIRY</button>
        </form>
      </section>
    </AppShell>
  ),
});
