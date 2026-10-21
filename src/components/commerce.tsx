import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Instagram,
  MapPin,
  Phone,
  MessageCircle,
  Minus,
  Plus,
  ArrowRight,
  Star,
  ShieldCheck,
  BadgeCheck,
  Facebook,
  Youtube,
  Droplets,
  Sun,
  Wind,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { CustomerAccountPage } from "@/components/customer-account";
import { CustomerCheckout } from "@/components/customer-checkout";
import { ReviewSlider } from "@/components/review-slider";
import { Toaster, toast } from "sonner";
import { announcements, formatINR } from "@/data/site";
import { useSiteSettings } from "@/lib/general-settings";
import {
  beautyNeeds,
  categoryBySlug,
  discountOf,
  type Product,
} from "@/data/catalog";
import { useLocation } from "@tanstack/react-router";
import { usePageContent } from "@/lib/site-settings";
import { useStoreCategories } from "@/lib/store-categories";
import { ShopProvider, useShop } from "@/lib/shop-store";
import { ADMIN_API_BASE, resolveImageUrl } from "@/lib/admin-api";
import heroGlow from "@/assets/hero-glow.jpg";
import heroFestive from "@/assets/hero_festive.png";
import promo from "@/assets/LCS_banner.png";
import beautyBanner from "@/assets/LGS Fairness Cream Beauty Display.png";
import dtanBanner from "@/assets/LGS D-TAN Skincare in Botanical Light.png";
import faceBarBanner from "@/assets/Luxury Anti-Blemishing Face Bar Display.png";
import storeShowcase from "@/assets/LGS Cosmetics Store Showcase.png";
import storeAisle from "@/assets/LGS Cosmetics Aisle Display.png";
import lgsCampaign from "@/assets/lgs-campaign.jpg";
import lgsLogo from "@/assets/lgs_logo.png";
import breadcrumbImage from "@/assets/lgs_breadcrub.png";
import storeFront from "@/assets/store-front.jpg";
import storeInterior from "@/assets/store-interior.jpg";
import storeShelf from "@/assets/store-shelf.jpg";
import cancellationPolicy from "@/content/policies/cancellation-and-return.txt?raw";
import privacyPolicy from "@/content/policies/privacy.txt?raw";
import shippingPolicy from "@/content/policies/shipping.txt?raw";
import termsPolicy from "@/content/policies/terms-and-conditions.txt?raw";

const nav = [
  ["Home", "/"],
  ["New Arrivals", "/new-arrivals"],
  ["Best Sellers", "/best-sellers"],
  ["Shop", "/shop"],
  ["LGS Products", "/lgs-products"],
  ["Blog", "/blog"],
  ["Contact", "/contact"],
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ShopProvider>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <Toaster position="top-center" richColors />
      <SocialFloatingButtons />
    </ShopProvider>
  );
}

function SocialFloatingButtons() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setOpen(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-center gap-3">
      {open && (
        <div className="flex flex-col items-center gap-3">
          <SocialIcons />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Hide social icons" : "Show social icons"}
        className="grid size-11 place-items-center rounded-full bg-white text-[#21b6da] shadow-[0_8px_14px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition hover:scale-105"
      >
        <X size={15} strokeWidth={2.4} className={open ? "" : "rotate-45"} />
      </button>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className="grid size-10 place-items-center rounded-full bg-gold text-wine-deep shadow-[0_10px_18px_rgba(0,0,0,0.18)] transition hover:scale-105"
      >
        <ArrowUp size={16} strokeWidth={2.6} />
      </button>
    </div>
  );
}

function SocialIcons({ footer = false }: { footer?: boolean }) {
  const { site, whatsappUrl } = useSiteSettings();
  return (
    <>
          <a
            href={site.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Open Instagram"
            className="grid size-10 place-items-center rounded-full bg-[#f95b9c] text-white shadow-[0_10px_18px_rgba(0,0,0,0.18)] transition hover:scale-105"
          >
            <Instagram size={15} strokeWidth={2.4} />
          </a>
          <a
            aria-label="Open Facebook"
            href={site.facebook}
            target="_blank"
            rel="noreferrer"
            className="grid size-10 place-items-center rounded-full bg-[#4c6faf] text-white shadow-[0_10px_18px_rgba(0,0,0,0.18)] opacity-95 transition hover:scale-105"
          >
            <Facebook size={15} strokeWidth={2.4} />
          </a>
          {!footer && <button
            type="button"
            aria-label="YouTube link coming soon"
            className="grid size-10 place-items-center rounded-full bg-[#ea4335] text-white shadow-[0_10px_18px_rgba(0,0,0,0.18)] opacity-95 transition hover:scale-105"
          >
            <Youtube size={15} strokeWidth={2.4} />
          </button>}
          {!footer && <a
            aria-label="Open WhatsApp"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_18px_rgba(0,0,0,0.18)] ring-2 ring-white transition hover:scale-105 hover:bg-[#1fbd59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25d366]"
          >
            <WhatsAppGlyph />
          </a>}
    </>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="block size-6 shrink-0">
      <path
        fill="currentColor"
        d="M19.11 17.23c-.28-.14-1.65-.81-1.9-.9-.26-.1-.44-.14-.63.14-.18.28-.72.9-.88 1.08-.16.19-.32.21-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.38-1.67-1.54-1.95-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.19-.28.28-.46.09-.18.05-.35-.02-.49-.07-.14-.63-1.52-.86-2.08-.23-.54-.46-.47-.63-.48l-.53-.01c-.18 0-.49.07-.75.35-.26.28-1.01.99-1.01 2.42 0 1.42 1.03 2.79 1.17 2.98.14.19 2.04 3.11 4.94 4.36.69.29 1.23.46 1.65.59.69.22 1.31.19 1.8.12.55-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.11-.26-.18-.54-.32z"
      />
      <path
        fill="currentColor"
        d="M16.04 2.67c-7.35 0-13.33 5.98-13.33 13.33 0 2.35.62 4.64 1.8 6.66L3 29.33l6.86-1.79a13.28 13.28 0 0 0 6.18 1.53h.01c7.35 0 13.33-5.98 13.33-13.33S23.39 2.67 16.04 2.67zm0 24.1h-.01a11.7 11.7 0 0 1-5.97-1.63l-.43-.25-4.07 1.06 1.09-3.96-.28-.41a11.7 11.7 0 1 1 9.67 5.19z"
      />
    </svg>
  );
}

function Header() {
  const { site } = useSiteSettings();
  const [notice, setNotice] = useState(0),
    [menu, setMenu] = useState(false);
  const { cartCount, setCartOpen, setSearchOpen, wishlist } = useShop();
  useEffect(() => {
    const id = setInterval(() => setNotice((x) => (x + 1) % announcements.length), 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <div className="flex h-8 items-center justify-center bg-wine-deep px-4 text-center text-[10px] font-semibold uppercase tracking-[.16em] text-white sm:text-xs">
        {announcements[notice]}
      </div>
      <header className="sticky top-0 z-40 border-b bg-ivory/95 backdrop-blur">
        <div className="container-lv flex h-[72px] items-center gap-4 lg:h-[84px]">
          <button
            className="grid size-11 shrink-0 place-items-center xl:hidden"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <a href="/" className="min-w-fit" aria-label={`${site.name} home`}>
            <img
              src={lgsLogo}
              alt={site.name}
              className="h-11 w-auto sm:h-12 lg:h-14"
            />
          </a>
          <button
            onClick={() => setSearchOpen(true)}
            className="mx-auto hidden h-11 max-w-xl flex-1 items-center gap-3 border bg-white px-4 text-left text-sm text-muted-foreground md:flex"
          >
            <Search size={18} />
            Search makeup, skincare, LGS products…
          </button>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="grid size-11 place-items-center md:hidden"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <a
              href="/account"
              className="hidden size-11 place-items-center sm:grid"
              aria-label="Account"
            >
              <User size={20} />
            </a>
            <a
              href="/wishlist"
              className="relative hidden size-11 place-items-center sm:grid"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlist.length > 0 && <Count n={wishlist.length} />}
            </a>
            <button
              onClick={() => setCartOpen(true)}
              className="relative grid size-11 place-items-center"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <Count n={cartCount} />}
            </button>
          </div>
        </div>
        <nav className="hidden border-t bg-white xl:block">
          <div className="container-lv flex h-11 items-center justify-center gap-6 overflow-hidden">
            {nav.map(([n, u]) => (
              <a
                className="link-underline whitespace-nowrap text-[11px] font-bold uppercase tracking-[.1em] hover:text-wine"
                href={u}
                key={u}
              >
                {n}
              </a>
            ))}
          </div>
        </nav>
      </header>
      {menu && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMenu(false)}>
          <aside
            className="h-full w-[86%] max-w-sm overflow-y-auto bg-ivory p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-2xl font-bold text-wine">{site.name}</span>
              <button aria-label="Close menu" className="grid size-11 place-items-center" onClick={() => setMenu(false)}>
                <X />
              </button>
            </div>
            {nav.map(([n, u]) => (
              <a
                className="flex min-h-12 items-center justify-between border-b text-sm font-semibold"
                href={u}
                key={u}
              >
                {n}
                <ArrowRight size={15} />
              </a>
            ))}
            <a href="/account" className="flex min-h-12 items-center border-b text-sm font-semibold">Account</a>
            <a href="/wishlist" className="flex min-h-12 items-center border-b text-sm font-semibold">Wishlist</a>
            <div className="mt-7 text-sm leading-7 text-muted-foreground">
              Need help?
              <br />
              <a className="font-bold text-wine" href={`tel:${site.phones[0]}`}>
                {site.phonesDisplay[0]}
              </a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
function Count({ n }: { n: number }) {
  return (
    <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-wine text-[10px] text-white">
      {n}
    </span>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const catName = categoryBySlug(p.category)?.name ?? p.type;
  const hasVariants = Boolean(p.variants?.length);
  const stock = p.stock ?? (p.inStock ? 24 : 0);
  const outOfStock = stock <= 0;
  const startingPrice = hasVariants ? Math.min(...(p.variants ?? []).map((v) => v.price)) : p.price;
  return (
    <article className="group flex h-full min-w-0 flex-col bg-white">
      <div className="relative aspect-[5/6] overflow-hidden bg-secondary">
        <a href={`/product/${p.slug}`}>
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition duration-700 group-hover:scale-105 group-hover:opacity-0"
          />
          <img
            src={p.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-2 opacity-0 transition duration-500 group-hover:opacity-100"
          />
        </a>
        <span className="absolute left-2 top-2 bg-wine px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
          {p.tags[0]}
        </span>
        {outOfStock ? (
          <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Out of stock</span>
        ) : stock <= 3 ? (
          <span className="absolute bottom-2 left-2 bg-[#db0107] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Only {stock} left</span>
        ) : null}
        <button
          onClick={() => toggleWishlist(p)}
          className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-white/90"
          aria-label="Save to wishlist"
        >
          <Heart size={17} className={isWishlisted(p.id) ? "fill-wine text-wine" : ""} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[9px] font-bold uppercase tracking-[.16em] text-muted-foreground">
          {p.brand} · {catName}
        </p>
        <a
          href={`/product/${p.slug}`}
          className="mt-1 line-clamp-2 min-h-[3rem] block font-display text-base font-semibold leading-6 sm:text-lg"
        >
          {p.name}
        </a>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {hasVariants ? `From ${formatINR(startingPrice)}` : p.size ? p.size : p.subtitle}
        </p>
        <div className="mt-1 flex items-center gap-1 text-[11px]">
          <Star size={12} className="fill-gold text-gold" />
          {p.rating} <span className="text-muted-foreground">({p.reviews})</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <b>{hasVariants ? `From ${formatINR(startingPrice)}` : formatINR(p.price)}</b>
          {!hasVariants && (
            <>
              <s className="text-xs text-muted-foreground">{formatINR(p.mrp)}</s>
              <span className="text-[10px] font-bold text-sale">{discountOf(p)}% OFF</span>
            </>
          )}
        </div>
        <button
          onClick={() => !outOfStock && addToCart(p)}
          disabled={outOfStock}
          className="mt-auto h-10 w-full border border-wine text-[10px] font-bold tracking-[.14em] text-wine transition hover:bg-wine hover:text-white disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400 disabled:hover:bg-transparent"
        >
          {outOfStock ? "OUT OF STOCK" : "ADD TO BAG"}
        </button>
      </div>
    </article>
  );
}

const heroes = [
  {
    image: dtanBanner,
    kicker: "Your skin care ritual",
    title: "Refresh Your Skin Routine",
    copy: "Explore the LGS D-Tan collection and make time for a little self-care.",
    cta: "DISCOVER D-TAN CARE",
    to: "/shop?need=sun-dtan-care",
    light: true,
  },
  {
    image: faceBarBanner,
    kicker: "Everyday cleansing, by LGS",
    title: "A Fresh Start for Your Skin",
    copy: "Discover LGS Anti Blemishing Face Bar for your daily cleansing routine.",
    cta: "EXPLORE FACE BAR",
    to: "/product/anti-blemishing-face-bar",
    light: false,
  },
];
export function HomePage() {
  const heroTouchStart = useRef<number | null>(null);
  const { adminProducts } = useShop();
  type TrendKey = "skin" | "hair" | "lgs";
  const [slide, setSlide] = useState(0),
    [trend, setTrend] = useState<TrendKey>("skin");
  useEffect(() => {
    const id = setInterval(() => setSlide((x) => (x + 1) % heroes.length), 6000);
    return () => clearInterval(id);
  }, []);
  const trending = adminProducts.filter((p) => {
    if (p.brand.trim().toLowerCase() !== "lgs") return false;
    if (trend === "skin") {
      return ["skincare", "skin-care", "face-care", "sun-care", "treatment-care"].includes(p.category)
        || ["face care", "moisturizers", "skin care", "lgs skincare"].includes(p.type.trim().toLowerCase());
    }
    if (trend === "hair") return p.category === "hair-care" || p.category === "hair-accessories";
    return true;
  }).slice(0, 4);
  return (
    <>
      <section aria-label="LGS featured collections" aria-roledescription="carousel" className="relative isolate grid overflow-hidden bg-wine-deep md:h-[480px] lg:aspect-[2.77/1] lg:h-auto lg:min-h-[420px]" onTouchStart={(event) => { heroTouchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => { const start = heroTouchStart.current; const end = event.changedTouches[0]?.clientX; if (start !== null && end !== undefined && Math.abs(end - start) > 50) setSlide((value) => (value + (end < start ? 1 : heroes.length - 1)) % heroes.length); heroTouchStart.current = null; }}>
        {heroes.map((h, i) => (
          <div
            key={h.title}
            aria-hidden={i !== slide}
            className={`relative col-start-1 row-start-1 min-w-0 transition-opacity duration-1000 ${h.light ? "bg-[#fbf0e4]" : "bg-[#4b0c1c]"} ${i === slide ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <img
              src={h.image}
              alt={h.title}
              fetchPriority={i === 0 ? "high" : "auto"}
              className="block aspect-[8/5] w-full object-cover object-right md:absolute md:inset-0 md:aspect-auto md:h-full md:object-center"
            />
            <div className={`absolute inset-0 hidden md:block ${h.light ? "bg-[linear-gradient(90deg,rgba(251,240,228,0.65),rgba(251,240,228,0.15)_38%,transparent_53%)]" : "bg-[linear-gradient(90deg,rgba(75,12,28,0.55),rgba(75,12,28,0.25)_35%,transparent_55%)]"}`} />
            <div className="container-lv relative flex items-center pt-7 pb-16 md:absolute md:inset-0 md:py-0">
              <div className={`w-full min-w-0 max-w-xl md:w-[48%] ${h.light ? "text-wine" : "text-white"}`}>
                <p className={`text-xs font-bold uppercase tracking-[.16em] sm:tracking-[.22em] ${h.light ? "text-wine/75" : "text-gold-soft"}`}>
                  {h.kicker}
                </p>
                <h1 className="mt-3 max-w-md text-[clamp(2rem,8vw,2.5rem)] leading-[1.1] md:text-5xl xl:text-6xl">
                  {h.title}
                </h1>
                <p className="mt-4 max-w-sm text-[15px] leading-6 opacity-85 md:text-base md:leading-7">
                  {h.copy}
                </p>
                <a
                  href={h.to}
                  tabIndex={i === slide ? 0 : -1}
                  className={`mt-6 inline-flex min-h-12 max-w-full items-center justify-center gap-3 px-5 py-3 text-xs font-bold tracking-[.08em] ${h.light ? "bg-wine text-white" : "bg-white text-wine"}`}
                >
                  {h.cta}
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => setSlide((value) => (value + heroes.length - 1) % heroes.length)}
          aria-label="Previous banner"
          className="absolute bottom-6 left-4 hidden size-12 place-items-center border border-white/40 bg-black/15 text-white lg:grid"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => setSlide((value) => (value + 1) % heroes.length)}
          aria-label="Next banner"
          className="absolute bottom-6 right-4 hidden size-12 place-items-center border border-white/40 bg-black/15 text-white lg:grid"
        >
          <ChevronRight />
        </button>
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center md:bottom-3">
          {heroes.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="grid size-11 place-items-center"
              aria-label={`Slide ${i + 1}`}
              aria-pressed={i === slide}
            ><span className={`block h-1.5 rounded-full transition-all ${i === slide ? "w-7 bg-gold" : "w-2 bg-gold/50"}`} /></button>
          ))}
        </div>
      </section>
      <ProductSection
        title="Our Best Sellers"
        sub="The beauty favourites customers return for."
        hideHeading
        list={adminProducts.filter((p) => p.tags.includes("bestseller")).slice(0, 6)}
      />
      <ProductSection
        title="New Arrivals"
        sub="Fresh beauty picks you'll love."
        list={adminProducts.filter((p) => p.tags.includes("new")).slice(0, 6)}
      />
      <Section title="Shop by Beauty Need">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {beautyNeeds.map((need, index) => {
            const Icon = [Droplets, Sun, Wind, Waves][index] ?? Droplets;
            const palette = ["bg-[#f7e9e4] text-[#8a4945]", "bg-[#faf0da] text-[#94702c]", "bg-[#eaf0e4] text-[#526849]", "bg-[#e8eef3] text-[#4c697e]"][index];
            return (
              <a href={need.to} key={need.slug} className={`group flex h-full flex-col items-center rounded-2xl border border-black/5 px-4 py-7 text-center transition duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine sm:px-6 sm:py-9 ${palette}`}>
                <span className="mb-5 grid size-16 place-items-center rounded-full border border-current/10 bg-white/65 sm:size-20">
                  <Icon className="size-8 sm:size-10" strokeWidth={1.3} aria-hidden="true" />
                </span>
                <h3 className="flex min-h-14 items-center justify-center text-xl leading-7 sm:text-2xl">{need.title}</h3>
                <p className="mt-3 max-w-52 flex-1 text-xs leading-6 opacity-80 sm:text-sm">{need.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] sm:text-xs">
                  Explore <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            );
          })}
        </div>
      </Section>
      <Section
        eyebrow="KOREGAON'S BEAUTY DESTINATION"
        title="More Than a Beauty Store"
        sub="Discover hundreds of beauty and personal care products under one roof."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <img
            src={storeShowcase}
            alt="LGS Cosmetics store showcase and product collections"
            loading="lazy"
            className="aspect-[3/2] w-full rounded-xl object-cover"
          />
          <img
            src={storeAisle}
            alt="LGS Cosmetics product shelves and store aisle"
            loading="lazy"
            className="aspect-[3/2] w-full rounded-xl object-cover"
          />
        </div>
        <a
          href="/contact"
          className="mt-7 inline-flex items-center gap-3 border-b border-wine pb-2 text-xs font-bold tracking-widest text-wine"
        >
          VISIT OUR STORE <ArrowRight size={15} />
        </a>
      </Section>
      <Section title="Trending Now">
        <div className="mb-8 flex gap-5 overflow-x-auto border-b">
          {(
            [
              ["Skin", "skin"],
              ["Hair", "hair"],
              ["LGS", "lgs"],
            ] as const
          ).map(([n, k]) => (
            <button
              onClick={() => setTrend(k)}
              className={`min-h-11 whitespace-nowrap border-b-2 text-xs font-bold uppercase tracking-wider ${trend === k ? "border-wine text-wine" : "border-transparent"}`}
              key={k}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {trending.map((p) => (
            <ProductCard p={p} key={p.id} />
          ))}
        </div>
      </Section>
      <Why />
      <InstagramBlock />
      <ReviewSlider />
      <section aria-label="LGS beauty collection" className="w-full py-8">
        <div className="relative overflow-hidden bg-[#4b0c1c] md:min-h-[440px]">
          <img
            src={beautyBanner}
            alt="LGS Fairness Cream beauty collection"
            loading="lazy"
            className="block aspect-[8/5] w-full object-cover object-right md:absolute md:inset-0 md:aspect-auto md:h-full md:object-center"
          />
          <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(75,12,28,0.55)_0%,rgba(75,12,28,0.45)_28%,rgba(75,12,28,0.12)_45%,transparent_58%)] md:block" />
          <div className="relative flex max-w-xl flex-col justify-center p-6 text-white sm:p-8 md:min-h-[440px] md:w-[48%] md:p-12">
            <p className="eyebrow !text-gold-soft">Made for every mood</p>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-6xl">Beauty That Feels Like You</h2>
            <p className="mt-4 leading-7 text-white/80">
              From everyday essentials to festive glam — discover everything under one roof.
            </p>
            <a
              href="/shop"
              className="mt-7 flex w-fit items-center gap-3 border-b border-gold pb-2 text-xs font-bold tracking-widest"
            >
              EXPLORE COLLECTION <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>
      <StoreCta />
    </>
  );
}

function Section({
  title,
  sub,
  eyebrow,
  children,
}: {
  title: string;
  sub?: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section className="container-lv overflow-hidden py-12 sm:py-20">
      {eyebrow && <p className="eyebrow text-center">{eyebrow}</p>}
      <h2 className="px-1 text-center text-3xl text-wine min-[375px]:text-4xl sm:text-5xl">
        {title}
      </h2>
      {sub && (
        <p className="mx-auto mt-3 max-w-[300px] text-center text-sm leading-6 text-muted-foreground sm:max-w-xl">
          {sub}
        </p>
      )}
      <div className="mt-8 sm:mt-11">{children}</div>
    </section>
  );
}
function ProductSection({ title, sub, list, hideHeading = false }: { title: string; sub: string; list: Product[]; hideHeading?: boolean }) {
  const content = (
      <div
        role="region"
        aria-label={`${title} products`}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-4 [scroll-padding-inline:1rem] [scrollbar-color:var(--wine)_transparent] [scrollbar-width:thin] [-webkit-overflow-scrolling:touch] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-6"
      >
        {list.map((p) => (
          <div className="w-[70%] shrink-0 snap-start min-[375px]:w-[46%] sm:w-[31%] md:w-auto" key={p.id}>
            <ProductCard p={p} />
          </div>
        ))}
      </div>
  );
  if (hideHeading) return list.length > 0 ? <section aria-label={title} className="container-lv overflow-hidden py-8">{content}</section> : null;
  return <Section title={title} sub={sub}>{content}</Section>;
}
function Why() {
  const items: [LucideIcon, string, string][] = [
    [BadgeCheck, "Wide Beauty Collection", "Everyday beauty to professional supplies."],
    [ShieldCheck, "Quality & Trust", "Products selected with care."],
    [ShoppingBag, "Retail + Wholesale", "Beauty essentials for every customer."],
    [MapPin, "Local Destination", "Conveniently in Koregaon, Satara."],
  ];
  return (
    <section className="border-y bg-white">
      <div className="container-lv grid grid-cols-2 gap-y-10 py-12 lg:grid-cols-4">
        {items.map(([Icon, t, c]) => (
          <div className="px-4 text-center" key={t}>
            <Icon className="mx-auto text-wine" />
            <h3 className="mt-3 text-lg">{t}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{c}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function InstagramBlock() {
  const { site } = useSiteSettings();
  const [posts, setPosts] = useState<{ id: number; image: string; caption?: string | null; link?: string | null }[]>([]);

  useEffect(() => {
    let active = true;
    fetch(`${ADMIN_API_BASE}/api/instagram-posts`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (active && Array.isArray(payload?.data)) setPosts(payload.data.slice(0, 12));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const items = posts;
  if (!items.length) return null;

  return (
    <Section title="Follow Our Beauty World" sub={site.instagramHandle}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((post) => (
          <a
            href={post.link || site.instagram}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-[9/16] overflow-hidden bg-secondary"
            key={post.id}
          >
            <img
              src={resolveImageUrl(post.image)}
              alt={post.caption || "LGS Cosmetics beauty inspiration"}
              loading="lazy"
              className="h-full w-full object-contain"
            />
            <span className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-2 bg-black/65 px-2 py-3 text-xs text-white">
              <Instagram size={16} /> View on Instagram
            </span>
          </a>
        ))}
      </div>
    </Section>
  );
}
function StoreCta() {
  const { site, whatsappUrl, mapsUrl, mapsEmbedUrl } = useSiteSettings();
  return (
    <section className="container-lv py-16">
      <div className="grid bg-wine text-white lg:grid-cols-2">
        <div className="p-7 sm:p-12">
          <p className="eyebrow !text-gold">COME SAY HELLO</p>
          <h2 className="mt-4 text-4xl sm:text-5xl">Visit LGS</h2>
          <p className="mt-5 leading-7 text-white/75">
            {site.address.line1}
            <br />
            {site.address.line2}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-gold px-5 py-3 text-xs font-bold text-wine"
            >
              GET DIRECTIONS
            </a>
            <a
              href={`tel:${site.phones[0]}`}
              className="border border-white/30 px-5 py-3 text-xs font-bold"
            >
              CALL NOW
            </a>
            <a href={whatsappUrl} className="border border-white/30 px-5 py-3 text-xs font-bold">
              WHATSAPP US
            </a>
          </div>
        </div>
        <div className="min-h-72 bg-secondary">
          <iframe
            title="LGS Cosmetics location"
            src={mapsEmbedUrl}
            className="h-full min-h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
function Footer() {
  const { site } = useSiteSettings();
  const { data: storeCategories = [] } = useStoreCategories();
  const columns = [
    {
      title: "SHOP",
      links: storeCategories.map((category) => [category.name, `/shop/${category.slug}`]),
    },
    {
      title: "DISCOVER",
      links: [
        ["New Arrivals", "/new-arrivals"],
        ["Best Sellers", "/best-sellers"],
        ["Gallery", "/gallery"],
        ["About Us", "/about"],
      ],
    },
    {
      title: "HELP",
      links: [
        ["Contact Us", "/contact"],
        ["My Account & Orders", "/account"],

        ["FAQs", "/faqs"],
        ["Shipping Information", "/shipping-information"],
        ["Cancellation & Return Policy", "/return-policy"],
        ["Privacy Policy", "/privacy-policy"],
        ["Terms & Conditions", "/terms-and-conditions"],
      ],
    },
  ] as const;
  return (
    <footer className="overflow-hidden bg-wine-deep text-white">
      <div className="container-lv grid min-w-0 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <a href="/" className="inline-flex" aria-label={`${site.name} home`}>
            <img src={lgsLogo} alt={site.name} className="h-14 w-auto" />
          </a>
          <p className="mt-3 max-w-[330px] text-sm leading-6 text-white/60 sm:max-w-sm">
            {site.tagline}. Beauty and personal care in Koregaon.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3" aria-label="Social media">
            <SocialIcons footer />
          </div>
          <div className="mt-4 space-y-1 text-xs leading-5 text-white/60">
            <a href={`tel:${site.phones[0]}`} className="flex w-fit items-center gap-2 whitespace-nowrap hover:text-white">
              <Phone size={15} aria-hidden="true" className="shrink-0" />
              {site.phonesDisplay[0]}
            </a>
            <p>{site.address.line1}, {site.address.line2}</p>
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-bold tracking-widest text-gold">{column.title}</p>
            <div className="mt-4 space-y-3">
              {column.links.map(([label, path]) => (
                <a href={path} className="block text-sm text-white/65 hover:text-white" key={path}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[10px] tracking-wide text-white/45">
        © 2026 All Rights Reserved By {site.name} and Designed By{" "}
        <a href="https://webakoof.com/" className="text-white/70 underline underline-offset-2 hover:text-white">
          Webakoof
        </a>
      </div>
    </footer>
  );
}

export function AccountPage() { return <CustomerAccountPage />; }

export function WishlistPage() {
  const { wishlist, catalogProducts } = useShop();
  const saved = catalogProducts.filter((product) => wishlist.includes(product.id));
  return (
    <>
      <PageHero title="Your Wishlist" copy="All the beauty favourites you saved in one place." />
      <section className="container-lv py-12">
        {saved.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {saved.map((product) => (
              <ProductCard p={product} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center text-center">
            <div>
              <Heart className="mx-auto size-10 text-wine" />
              <h2 className="mt-4 text-3xl text-wine">Your wishlist is empty</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tap the heart on any product to save it here.
              </p>
              <a
                href="/shop"
                className="mt-7 inline-flex h-12 items-center gap-3 bg-wine px-7 text-xs font-bold text-white"
              >
                DISCOVER PRODUCTS <ArrowRight size={15} />
              </a>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export type InfoPageKey =
  | "about"
  | "gallery"
  | "faqs"
  | "shipping-information"
  | "return-policy"
  | "privacy-policy"
  | "terms-and-conditions";

const infoPages: Record<
  InfoPageKey,
  { title: string; intro: string; sections: { heading: string; text: string }[] }
> = {
  about: {
    title: "About LGS Cosmetics",
    intro:
      "Your local destination for beauty and personal care in Koregaon.",
    sections: [
      {
        heading: "Beauty Under One Roof",
        text: "LGS Cosmetics brings cosmetics, skincare, personal care, imitation jewellery and accessories together in one convenient store.",
      },
      {
        heading: "Quality & Trust",
        text: "Our team helps customers explore products for everyday routines, festive looks and professional beauty requirements without making unsupported claims about any product.",
      },
      {
        heading: "Discover LGS",
        text: "LGS Cosmetics brings skin and hair care essentials together for your everyday routine.",
      },
    ],
  },
  gallery: {
    title: "Beauty Mall Gallery",
    intro: "A glimpse inside our Koregaon store, collections and professional beauty range.",
    sections: [],
  },
  faqs: {
    title: "Frequently Asked Questions",
    intro: "Quick answers before you shop or visit our store.",
    sections: [
      {
        heading: "Can I order products online?",
        text: "Sign in and complete checkout to place your order. View order history, payment status and parcel updates in My Account & Orders.",
      },
      {
        heading: "Can I collect my order from the store?",
        text: "Yes. Choose store pickup during checkout and our team will confirm when your products are ready.",
      },
    ],
  },
  "shipping-information": {
    title: "Shipping Information",
    intro: "Clear delivery information for LGS Cosmetics customers.",
    sections: [
      {
        heading: "Order Confirmation",
        text: "Delivery charges appear at checkout. After dispatch, your account shows the courier, tracking number and available tracking link.",
      },
      {
        heading: "Delivery Area",
        text: "Local and outstation delivery options can vary by product type, order value and destination.",
      },
    ],
  },
  "return-policy": {
    title: "Return Policy",
    intro: "Please review products carefully when your order is confirmed.",
    sections: [
      {
        heading: "Eligibility",
        text: "Return or replacement eligibility depends on product condition, hygiene restrictions, damage evidence and manufacturer policy. Opened cosmetics and personal-care products may not be returnable for hygiene reasons.",
      },
      {
        heading: "Report an Issue",
        text: "Contact the store promptly with your order details and clear photos if an item arrives damaged, incorrect or incomplete.",
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    intro: "How customer information is handled on this storefront.",
    sections: [
      {
        heading: "Information You Provide",
        text: "Your account and checkout details are stored securely to process orders and provide order history, payment status and delivery updates.",
      },
      {
        heading: "Local Shopping Data",
        text: "Bag and wishlist selections are currently stored in your browser for convenience and can be cleared through your browser settings.",
      },
    ],
  },
  "terms-and-conditions": {
    title: "Terms & Conditions",
    intro: "Important information about using this website.",
    sections: [
      {
        heading: "Product Information",
        text: "Products, prices, offers and availability shown in this frontend are illustrative until confirmed by the store. Images may be replaceable presentation assets.",
      },
      {
        heading: "Orders & Payments",
        text: "Submitting checkout does not create a final paid order until availability, delivery and payment are confirmed by LGS Cosmetics.",
      },
    ],
  },
};

const policyDocuments: Partial<Record<InfoPageKey, string>> = {
  "shipping-information": shippingPolicy,
  "return-policy": cancellationPolicy,
  "privacy-policy": privacyPolicy,
  "terms-and-conditions": termsPolicy,
};

const policyTitles: Partial<Record<InfoPageKey, string>> = {
  "shipping-information": "Shipping Policy",
  "return-policy": "Cancellation & Return Policy",
  "privacy-policy": "Privacy Policy",
  "terms-and-conditions": "Terms & Conditions",
};

type ParsedPolicySection = {
  heading: string;
  paragraphs: string[];
  bullets: string[];
};

type ParsedPolicy = {
  lastUpdated: string;
  sections: ParsedPolicySection[];
};

function parsePolicyDocument(raw: string): ParsedPolicy {
  const lines = raw.replace(/\r/g, "").split("\n").map((line) => line.trim());
  const firstContentIndex = lines.findIndex(Boolean);
  const lastUpdated = lines.find((line) => /^Last Updated:/i.test(line))?.replace(/^Last Updated:\s*/i, "") ?? "";
  const sections: ParsedPolicySection[] = [];
  let current: ParsedPolicySection = { heading: "Overview", paragraphs: [], bullets: [] };
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      current.paragraphs.push(paragraphLines.join(" "));
      paragraphLines = [];
    }
  };

  const flushSection = () => {
    flushParagraph();
    if (current.paragraphs.length > 0 || current.bullets.length > 0) sections.push(current);
  };

  for (const line of lines.slice(firstContentIndex + 1)) {
    if (!line) {
      flushParagraph();
      continue;
    }
    const heading = line.match(/^(\d+)\.\s+(.+)$/);
    if (heading) {
      flushSection();
      current = { heading: `${heading[1]}. ${heading[2]}`, paragraphs: [], bullets: [] };
      continue;
    }
    if (line.startsWith("* ")) {
      flushParagraph();
      current.bullets.push(line.slice(2));
      continue;
    }
    if (/^Last Updated:/i.test(line) || /^©|^Â©/.test(line)) continue;
    paragraphLines.push(line);
  }
  flushSection();

  return { lastUpdated, sections };
}

function PolicyPage({ page }: { page: InfoPageKey }) {
  const { site } = useSiteSettings();
  const raw = policyDocuments[page];
  const title = policyTitles[page];
  if (!raw || !title) return null;
  const policy = parsePolicyDocument(raw);

  return (
    <>
      <PageHero
        title={title}
        copy={policy.lastUpdated ? `Last updated: ${policy.lastUpdated}` : "Please review this policy before placing an order."}
      />
      <section className="container-lv py-12 sm:py-16">
        <div className="mx-auto max-w-4xl space-y-8">
          {policy.sections.map((section) => (
            <article className="border-b border-wine/10 pb-8 last:border-0" key={section.heading}>
              <h2 className="text-2xl text-wine sm:text-3xl">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets.length > 0 && (
                  <ul className="list-disc space-y-2 pl-5 marker:text-wine">
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                )}
              </div>
            </article>
          ))}
          <div className="bg-secondary p-6 text-sm leading-7">
            <b>Need more help?</b>
            <br />
            Call {site.phonesDisplay[0]} or visit our store at {site.address.line1}, {site.address.line2}.
          </div>
        </div>
      </section>
    </>
  );
}

export function InfoPage({ page }: { page: InfoPageKey }) {
  const { site } = useSiteSettings();
  if (policyDocuments[page]) return <PolicyPage page={page} />;
  const content = infoPages[page];
  if (page === "gallery")
    return (
      <>
        <PageHero title={content.title} copy={content.intro} />
        <section className="container-lv py-12">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              storeFront,
              storeInterior,
              storeShelf,
              heroFestive,
              lgsCampaign,
              promo,
              heroGlow,
            ].map((image, index) => (
              <img
                src={image}
                alt={`LGS Cosmetics gallery ${index + 1}`}
                className={`w-full object-cover ${index % 3 === 0 ? "row-span-2 h-full min-h-72" : "h-72"}`}
                loading="lazy"
                key={image}
              />
            ))}
          </div>
        </section>
      </>
    );
  return (
    <>
      <PageHero title={content.title} copy={content.intro} />
      <section className="container-lv py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          {content.sections.map((section) => (
            <article className="border-b pb-8" key={section.heading}>
              <h2 className="text-3xl text-wine">{section.heading}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.text}</p>
            </article>
          ))}
          <div className="bg-secondary p-6 text-sm leading-7">
            <b>Need more help?</b>
            <br />
            Call {site.phonesDisplay[0]} or visit our store at {site.address.line1},{" "}
            {site.address.line2}.
          </div>
        </div>
      </section>
    </>
  );
}

function CartDrawer() {
  const { cartOpen, setCartOpen, lines, subtotal, setQty, removeFromCart } = useShop();
  if (!cartOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setCartOpen(false)}>
      <aside
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <h2 className="text-2xl">Your Bag</h2>
          <button onClick={() => setCartOpen(false)} className="grid size-11 place-items-center">
            <X />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {lines.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <ShoppingBag className="mx-auto text-muted-foreground" />
                <p className="mt-3 font-display text-2xl">Your bag is waiting</p>
                <button
                  onClick={() => setCartOpen(false)}
                  className="mt-4 text-xs font-bold text-wine"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            </div>
          ) : (
            lines.map(({ line, product }) => (
              <div className="flex gap-4 border-b py-4" key={`${product.id}-${line.shade ?? "default"}-${line.variant ?? "default"}`}>
                <img src={product.image} alt="" className="size-24 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.variant || line.shade || product.subtitle}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center border">
                      <button
                        onClick={() => setQty(product.id, line.qty - 1, line.shade, line.variant)}
                        className="grid size-8 place-items-center"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-7 text-center text-xs">{line.qty}</span>
                      <button
                        onClick={() => setQty(product.id, line.qty + 1, line.shade, line.variant)}
                        className="grid size-8 place-items-center"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <b className="text-sm">
                      {formatINR((product.variants?.find((v) => v.label === line.variant)?.price ?? product.price) *
                          line.qty,
                      )}
                    </b>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id, line.shade, line.variant)}
                    className="mt-2 text-[10px] underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {lines.length > 0 && (
          <div className="border-t p-5">
            <div className="mb-4 flex justify-between">
              <span>Subtotal</span>
              <b>{formatINR(subtotal)}</b>
            </div>
            <a
              href="/checkout"
              className="grid h-13 place-items-center bg-wine text-xs font-bold tracking-widest text-white"
            >
              CHECKOUT
            </a>
            <button onClick={() => setCartOpen(false)} className="mt-3 w-full text-xs underline">
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
function SearchOverlay() {
  const { searchOpen, setSearchOpen, catalogProducts } = useShop();
  const [q, setQ] = useState("");
  const results = useMemo(() => catalogProducts.filter((p) =>
    `${p.name} ${p.brand} ${p.category} ${p.type}`.toLowerCase().includes(q.trim().toLowerCase()),
  ).slice(0, 6), [q, catalogProducts]);
  if (!searchOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ivory pb-8">
      <div className="container-lv">
        <div className="flex h-20 items-center gap-3 border-b">
          <Search />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search makeup, skincare, LGS products…"
            className="h-full min-w-0 flex-1 bg-transparent text-lg outline-none"
          />
          <button onClick={() => setSearchOpen(false)} className="grid size-11 place-items-center">
            <X />
          </button>
        </div>
        <div className="mx-auto mt-10 max-w-4xl">
          <p className="eyebrow">{q ? `${results.length} RESULTS` : "POPULAR SEARCHES"}</p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <a href={`/product/${p.slug}`} className="flex min-w-0 gap-3 bg-white p-2" key={p.id}>
                <img src={p.image} className="size-20 object-cover" alt="" />
                <div>
                  <p className="font-display text-lg leading-tight">{p.name}</p>
                  <b className="text-xs">{formatINR(p.price)}</b>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CatalogPage({
  title = "Shop All Beauty",
  filter,
}: {
  title?: string;
  filter?: (p: Product) => boolean;
}) {
  const { adminProducts, catalogError } = useShop();
  const [sort, setSort] = useState<"featured" | "price" | "price-desc" | "newest">("featured");
  const source = adminProducts;
  const filteredProducts = filter ? source.filter(filter) : source;
  const list = [...filteredProducts].sort((a, b) => {
    if (sort === "price") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "newest") {
      const aIsNew = a.tags.includes("new") ? 1 : 0;
      const bIsNew = b.tags.includes("new") ? 1 : 0;
      return bIsNew - aIsNew;
    }
    return 0;
  });
  return (
    <>
      <PageHero title={title} copy={`${list.length} carefully selected beauty essentials`} />
      <div className="container-lv py-10">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <span className="text-xs text-muted-foreground">{list.length} PRODUCTS</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="border bg-white px-3 py-2 text-xs"
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="price">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        {catalogError ? (
          <p role="alert" className="py-12 text-center text-muted-foreground">Unable to load products. Please refresh the page to try again.</p>
        ) : list.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No products available yet.</p>
        ) : null}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard p={p} key={p.id} />
          ))}
        </div>
      </div>
    </>
  );
}
export function PageHero({ title, copy }: { title: string; copy: string }) {
  const { site } = useSiteSettings();
  const pathname = useLocation({ select: (location) => location.pathname });
  const { data: content } = usePageContent(pathname);
  const heading = content?.title || title;
  return (
    <>
    <section
      className="overflow-hidden bg-[#f7ece5] bg-cover bg-center px-4 py-12 text-center text-wine sm:py-20"
      style={{ backgroundImage: `url(${breadcrumbImage})` }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[.22em] text-wine">
        {site.name}
      </p>
      <h1 className="mx-auto mt-3 max-w-[340px] text-4xl leading-tight sm:max-w-3xl sm:text-6xl">
        {heading}
      </h1>
      <nav aria-label="Breadcrumb" className="mt-4 text-xs font-medium">
        <ol className="flex flex-wrap items-center justify-center gap-2">
          <li><a href="/" className="underline-offset-4 hover:underline">Home</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{heading}</li>
        </ol>
      </nav>
      <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-wine/80 sm:max-w-xl">
        {content ? content.intro : copy}
      </p>
    </section>
    {content?.body && <section className="container-lv py-10"><div className="mx-auto max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground">{content.body}</div></section>}
    </>
  );
}
export function ProductPage({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted, catalogProducts } = useShop();
  const [qty, setQty] = useState(1),
    [shade, setShade] = useState(product.shades?.[0]?.name),
    [variant, setVariant] = useState(product.variants?.[0]?.label),
    [selectedImage, setSelectedImage] = useState(product.image);
  const galleryImages = Array.from(new Set([product.image, product.hoverImage, ...(product.galleryImages ?? [])]));
  useEffect(() => setSelectedImage(product.image), [product.image]);
  const selectedVariant = product.variants?.find((v) => v.label === variant) ?? product.variants?.[0];
  const activePrice = selectedVariant?.price ?? product.price;
  const activeMrp = selectedVariant?.mrp ?? product.mrp;
  const currentDetails = [
    ...product.details,
    ...(product.keyIngredients ? [`Key Ingredients: ${product.keyIngredients.join(", ")}`] : []),
  ];
  return (
    <>
      <PageHero title={product.name} copy={product.subtitle} />
    <div className="container-lv py-8">
      <div className="grid gap-8 md:grid-cols-2 md:gap-6 lg:gap-8">
        <div className="grid grid-cols-[58px_1fr] gap-2 min-[390px]:grid-cols-[68px_1fr] min-[390px]:gap-3 md:grid-cols-[52px_1fr] lg:grid-cols-[72px_1fr]">
          <div className="space-y-3">
            {galleryImages.map((image, index) => (
              <button
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`block aspect-square w-full overflow-hidden border-2 transition ${
                  selectedImage === image ? "border-wine" : "border-transparent hover:border-gold"
                }`}
                aria-label={`View ${product.name} image ${index + 1}`}
                aria-pressed={selectedImage === image}
                key={image}
              >
                <img
                  src={image}
                  className="h-full w-full object-contain"
                  alt={`${product.name} view ${index + 1}`}
                />
              </button>
            ))}
          </div>
          <div className="aspect-[5/6] overflow-hidden bg-secondary">
            <img
              src={selectedImage}
              alt={product.name}
              className="h-full w-full object-contain p-2 transition-opacity duration-300"
            />
          </div>
        </div>
        <div className="md:px-2 lg:px-8">
          <p className="eyebrow">{product.brand}</p>
          <h2 className="mt-3 text-3xl leading-tight text-wine min-[390px]:text-4xl md:text-3xl lg:text-5xl">
            {product.name}
          </h2>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Star size={15} className="fill-gold text-gold" />
            {product.rating} ({product.reviews} reviews)
          </div>
          <div className="mt-6 flex items-center gap-3">
            <b className="text-2xl">{formatINR(activePrice)}</b>
            {activeMrp > activePrice && (
              <>
                <s className="text-muted-foreground">{formatINR(activeMrp)}</s>
                <span className="font-bold text-sale">
                  {Math.round(((activeMrp - activePrice) / activeMrp) * 100)}% OFF
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
          {product.variants && (
            <div className="mt-7">
              <p className="text-xs font-bold uppercase tracking-wider">Select Size</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => setVariant(v.label)}
                    className={`min-h-10 rounded-full border px-4 text-xs font-bold transition ${
                      variant === v.label
                        ? "border-wine bg-wine text-white"
                        : "border-border bg-white text-foreground hover:border-wine"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.shades && (
            <div className="mt-7">
              <p className="text-xs font-bold uppercase tracking-wider">Shade: {shade}</p>
              <div className="mt-3 flex gap-2">
                {product.shades.map((s) => (
                  <button
                    onClick={() => setShade(s.name)}
                    className={`size-9 rounded-full border-2 p-1 ${shade === s.name ? "border-wine" : "border-transparent"}`}
                    title={s.name}
                    key={s.name}
                  >
                    <span className="block size-full rounded-full" style={{ background: s.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex h-13 items-center border">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="grid size-11 place-items-center"
              >
                <Minus size={15} />
              </button>
              <span className="w-7 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="grid size-11 place-items-center">
                <Plus size={15} />
              </button>
            </div>
            <button
              onClick={() => addToCart(product, { qty, shade, variant })}
              className="min-h-13 min-w-[150px] flex-1 bg-wine text-xs font-bold tracking-widest text-white"
            >
              ADD TO BAG
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className="grid size-13 place-items-center border"
            >
              <Heart className={isWishlisted(product.id) ? "fill-wine text-wine" : ""} />
            </button>
          </div>
          <button
            onClick={() => {
              addToCart(product, { qty, shade, variant });
              location.href = "/checkout";
            }}
            className="mt-3 h-13 w-full bg-gold text-xs font-bold tracking-widest text-wine-deep"
          >
            BUY NOW
          </button>
          <div className="mt-8 grid grid-cols-3 border-y py-5 text-center text-[10px] font-semibold">
            <span>
              <BadgeCheck className="mx-auto mb-2" />
              Genuine Products
            </span>
            <span>
              <ShieldCheck className="mx-auto mb-2" />
              Secure Shopping
            </span>
            <span>
              <Phone className="mx-auto mb-2" />
              Store Support
            </span>
          </div>
          <div className="mt-8 space-y-5">
            <div>
              <h3 className="text-xl">Product Description</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{product.description}</p>
            </div>
            <div>
              <h3 className="text-xl">Key Benefits</h3>
              <ul className="mt-2 list-inside list-disc text-sm leading-7 text-muted-foreground">
                {product.benefits.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            {product.keyIngredients && (
              <div>
                <h3 className="text-xl">Key Ingredients</h3>
                <ul className="mt-2 list-inside list-disc text-sm leading-7 text-muted-foreground">
                  {product.keyIngredients.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h3 className="text-xl">How to Use</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{product.howToUse}</p>
            </div>
            <div>
              <h3 className="text-xl">Product Details</h3>
              <ul className="mt-2 list-inside list-disc text-sm leading-7 text-muted-foreground">
                {currentDetails.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 sm:mt-16">
        <ProductSection
          title="You May Also Like"
          sub="More picks for your routine."
          list={catalogProducts
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 4)}
        />
      </div>
    </div>
    </>
  );
}

export function CheckoutPage() { return <CustomerCheckout />; }
