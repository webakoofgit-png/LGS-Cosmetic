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
  type LucideIcon,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { announcements, formatINR, mapsUrl, site, whatsappUrl } from "@/data/site";
import {
  beautyNeeds,
  byTag,
  categories,
  discountOf,
  products,
  searchProducts,
  type Product,
} from "@/data/catalog";
import { ShopProvider, useShop } from "@/lib/shop-store";
import heroGlow from "@/assets/hero-glow.jpg";
import heroLgs from "@/assets/hero-lgs.jpg";
import heroSalon from "@/assets/hero-salon.jpg";
import heroFestive from "@/assets/hero-festive.jpg";
import promo from "@/assets/promo-editorial.jpg";
import lgsCampaign from "@/assets/lgs-campaign.jpg";
import storeFront from "@/assets/store-front.jpg";
import storeInterior from "@/assets/store-interior.jpg";
import storeShelf from "@/assets/store-shelf.jpg";

const nav = [
  ["Home", "/"],
  ["New Arrivals", "/new-arrivals"],
  ["Best Sellers", "/best-sellers"],
  ["Shop", "/shop"],
  ["LGS Products", "/lgs-products"],
  ["Makeup", "/shop/makeup"],
  ["Skincare", "/shop/skincare"],
  ["Nail Care", "/shop/nail-care"],
  ["Jewellery", "/shop/jewellery"],
  ["Offers", "/offers"],
  ["For Salons", "/for-salons"],
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
      <a
        href={whatsappUrl}
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-4 z-40 grid size-12 place-items-center rounded-full bg-[#218c55] text-white shadow-lg transition hover:scale-105"
      >
        <MessageCircle size={22} />
      </a>
    </ShopProvider>
  );
}

function Header() {
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
            className="grid size-11 place-items-center lg:hidden"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <a href="/" className="min-w-fit text-center leading-none">
            <span className="block font-display text-2xl font-bold tracking-[.08em] text-wine sm:text-3xl">
              LUCKY
            </span>
            <span className="mt-1 block text-[8px] font-semibold tracking-[.24em] text-gold">
              VARIETIES BEAUTY MALL
            </span>
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
        <nav className="hidden border-t bg-white lg:block">
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
              <span className="font-display text-2xl font-bold text-wine">LUCKY</span>
              <button className="grid size-11 place-items-center" onClick={() => setMenu(false)}>
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
  return (
    <article className="group min-w-0 bg-white">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <a href={`/product/${p.slug}`}>
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-0"
          />
          <img
            src={p.hoverImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          />
        </a>
        <span className="absolute left-2 top-2 bg-wine px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
          {p.tags[0]}
        </span>
        <button
          onClick={() => toggleWishlist(p)}
          className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-white/90"
          aria-label="Save to wishlist"
        >
          <Heart size={17} className={isWishlisted(p.id) ? "fill-wine text-wine" : ""} />
        </button>
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[9px] font-bold uppercase tracking-[.16em] text-muted-foreground">
          {p.brand}
        </p>
        <a
          href={`/product/${p.slug}`}
          className="mt-1 line-clamp-1 block font-display text-base font-semibold sm:text-lg"
        >
          {p.name}
        </a>
        <div className="mt-1 flex items-center gap-1 text-[11px]">
          <Star size={12} className="fill-gold text-gold" />
          {p.rating} <span className="text-muted-foreground">({p.reviews})</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <b>{formatINR(p.price)}</b>
          <s className="text-xs text-muted-foreground">{formatINR(p.mrp)}</s>
          <span className="text-[10px] font-bold text-sale">{discountOf(p)}% OFF</span>
        </div>
        <button
          onClick={() => addToCart(p)}
          className="mt-3 h-10 w-full border border-wine text-[10px] font-bold tracking-[.14em] text-wine transition hover:bg-wine hover:text-white"
        >
          ADD TO BAG
        </button>
      </div>
    </article>
  );
}

const heroes = [
  {
    image: heroGlow,
    kicker: "Beauty, curated for you",
    title: "Glow Starts Here",
    copy: "Discover beauty, skincare and self-care for your everyday glow.",
    cta: "SHOP NOW",
    to: "/shop",
  },
  {
    image: heroLgs,
    kicker: "Our own collection",
    title: "Discover LGS Beauty",
    copy: "Thoughtful everyday skincare, made to belong in your routine.",
    cta: "EXPLORE LGS",
    to: "/lgs-products",
  },
  {
    image: heroSalon,
    kicker: "Retail & wholesale",
    title: "Everything Your Salon Needs",
    copy: "Professional equipment, machines and beauty supplies under one roof.",
    cta: "FOR SALONS",
    to: "/for-salons",
  },
  {
    image: heroFestive,
    kicker: "Celebrate your glow",
    title: "Festive Beauty Edit",
    copy: "Statement colour, sparkling accessories and gifting-ready favourites.",
    cta: "VIEW OFFERS",
    to: "/offers",
  },
];
export function HomePage() {
  const [slide, setSlide] = useState(0),
    [trend, setTrend] = useState("makeup");
  useEffect(() => {
    const id = setInterval(() => setSlide((x) => (x + 1) % heroes.length), 6000);
    return () => clearInterval(id);
  }, []);
  const trending = products.filter((p) => p.category === trend).slice(0, 4);
  return (
    <>
      <section className="relative min-h-[540px] overflow-hidden bg-wine-deep min-[375px]:min-h-[570px] sm:min-h-[680px] lg:min-h-[calc(100vh-163px)]">
        {heroes.map((h, i) => (
          <div
            key={h.title}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <img
              src={h.image}
              alt={h.title}
              className={`h-full w-full object-cover transition-transform duration-[7000ms] ${i === slide ? "scale-105" : "scale-100"}`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
            <div className="container-lv absolute inset-0 flex items-center">
              <div className="w-[calc(100vw-2rem)] max-w-xl text-white sm:w-auto">
                <p className="text-xs font-bold uppercase tracking-[.25em] text-gold-soft">
                  {h.kicker}
                </p>
                <h1 className="mt-4 max-w-[310px] text-[2.65rem] leading-[.94] min-[375px]:text-5xl sm:max-w-xl sm:text-7xl lg:text-8xl">
                  {h.title}
                </h1>
                <p className="mt-5 max-w-[310px] text-sm leading-6 text-white/85 min-[375px]:max-w-sm sm:max-w-md sm:text-base sm:leading-7">
                  {h.copy}
                </p>
                <a
                  href={h.to}
                  className="mt-8 inline-flex h-12 items-center gap-5 bg-white px-7 text-xs font-bold tracking-[.15em] text-wine"
                >
                  {h.cta}
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => setSlide((slide + 3) % 4)}
          className="absolute left-4 top-1/2 hidden size-12 place-items-center border border-white/40 text-white lg:grid"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => setSlide((slide + 1) % 4)}
          className="absolute right-4 top-1/2 hidden size-12 place-items-center border border-white/40 text-white lg:grid"
        >
          <ChevronRight />
        </button>
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {heroes.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all ${i === slide ? "w-8 bg-gold" : "w-2 bg-white/60"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>
      <Section title="Glam Yourself" sub="Everything you need for your perfect beauty routine.">
        <div className="swipe-row -mx-4 gap-3 px-4 md:mx-0 md:grid md:grid-cols-4 md:px-0">
          {categories.map((c) => (
            <a
              href={c.slug === "lgs-products" ? "/lgs-products" : `/shop/${c.slug}`}
              className="group relative w-[68vw] max-w-[280px] overflow-hidden md:w-auto md:max-w-none"
              key={c.slug}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-16 text-white">
                <h3 className="text-2xl">{c.name}</h3>
                <span className="mt-1 flex items-center gap-2 text-[10px] font-bold tracking-wider">
                  SHOP NOW <ArrowRight size={13} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </Section>
      <ProductSection
        title="Our Best Sellers"
        sub="The beauty favourites customers return for."
        list={byTag("bestseller").slice(0, 6)}
      />
      <section className="container-lv py-8">
        <div className="relative min-h-[440px] overflow-hidden">
          <img
            src={promo}
            alt="Beauty collection"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-wine-deep/90 to-transparent" />
          <div className="relative flex min-h-[440px] max-w-xl flex-col justify-center p-7 text-white sm:p-14">
            <p className="eyebrow !text-gold-soft">Made for every mood</p>
            <h2 className="mt-4 text-5xl sm:text-6xl">Beauty That Feels Like You</h2>
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
      <Section
        eyebrow="THE HOUSE BRAND"
        title="Discover LGS"
        sub="Our own beauty & skincare collection."
      >
        <div className="grid overflow-hidden bg-wine-deep lg:grid-cols-2">
          <img
            src={lgsCampaign}
            alt="LGS beauty collection"
            loading="lazy"
            className="h-full min-h-[420px] w-full object-cover"
          />
          <div className="p-5 sm:p-10">
            <div className="grid grid-cols-2 gap-3">
              {products
                .filter((p) => p.brand === "LGS")
                .slice(0, 4)
                .map((p) => (
                  <ProductCard p={p} key={p.id} />
                ))}
            </div>
            <a
              href="/lgs-products"
              className="mt-8 inline-flex items-center gap-3 text-xs font-bold tracking-widest text-gold-soft"
            >
              SHOP ALL LGS PRODUCTS <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </Section>
      <ProductSection
        title="Just In"
        sub="Fresh beauty picks you'll love."
        list={byTag("new").slice(0, 6)}
      />
      <Section title="Shop by Beauty Need">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {beautyNeeds.map((x) => (
            <a href={x.to} className="group relative aspect-[4/3] overflow-hidden" key={x.title}>
              <img
                src={x.image}
                alt={x.title}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-7">
                <h3 className="text-xl sm:text-3xl">{x.title}</h3>
                <span className="mt-2 block text-[10px] font-bold tracking-widest opacity-0 transition group-hover:opacity-100">
                  SHOP NOW →
                </span>
              </div>
            </a>
          ))}
        </div>
      </Section>
      <section className="bg-wine-deep py-16 text-white">
        <div className="container-lv">
          <p className="eyebrow !text-gold">PROFESSIONAL BEAUTY</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="text-5xl sm:text-6xl">For Salon Professionals</h2>
              <p className="mt-5 max-w-xl leading-7 text-white/70">
                Professional products. Salon equipment. Wholesale solutions. Serving salon & beauty
                professionals across Satara district.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="/for-salons"
                  className="bg-gold px-6 py-4 text-xs font-bold text-wine-deep"
                >
                  EXPLORE SALON SUPPLIES
                </a>
                <a
                  href={whatsappUrl}
                  className="border border-white/40 px-6 py-4 text-xs font-bold"
                >
                  GET WHOLESALE QUOTE
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/15">
              {[
                "Salon Chairs",
                "Hydra Facial Machines",
                "Beauty Equipment",
                "Wholesale Supplies",
              ].map((x) => (
                <div className="bg-wine p-5 text-sm sm:p-8" key={x}>
                  <ArrowRight className="mb-8 text-gold" />
                  <h3 className="text-xl">{x}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Section
        eyebrow="KOREGAON'S BEAUTY DESTINATION"
        title="More Than a Beauty Store"
        sub="Discover hundreds of beauty, personal care and salon products under one roof."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <img
            src={storeFront}
            alt="Lucky Varieties storefront"
            loading="lazy"
            className="h-80 w-full object-cover lg:col-span-2"
          />
          <img
            src={storeInterior}
            alt="Store interior"
            loading="lazy"
            className="h-80 w-full object-cover"
          />
          <img
            src={storeShelf}
            alt="Beauty product displays"
            loading="lazy"
            className="h-80 w-full object-cover"
          />
        </div>
        <a
          href="/contact"
          className="mt-7 inline-flex items-center gap-3 border-b border-wine pb-2 text-xs font-bold tracking-widest text-wine"
        >
          VISIT OUR STORE <ArrowRight size={15} />
        </a>
      </Section>
      <VideoExperience />
      <Section title="Trending Now">
        <div className="mb-8 flex gap-5 overflow-x-auto border-b">
          {(
            [
              ["Makeup", "makeup"],
              ["Skincare", "skincare"],
              ["Nails", "nail-care"],
              ["LGS", "lgs-products"],
              ["Accessories", "hair-accessories"],
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
      <Reviews />
      <StoreCta />
      <Newsletter />
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
function ProductSection({ title, sub, list }: { title: string; sub: string; list: Product[] }) {
  return (
    <Section title={title} sub={sub}>
      <div className="swipe-row -mx-4 gap-3 px-4 md:mx-0 md:grid md:grid-cols-3 md:px-0 lg:grid-cols-6">
        {list.map((p) => (
          <div className="w-[calc((100vw-2.75rem)/2)] max-w-none md:w-auto" key={p.id}>
            <ProductCard p={p} />
          </div>
        ))}
      </div>
    </Section>
  );
}
function Why() {
  const items: [LucideIcon, string, string][] = [
    [BadgeCheck, "Wide Beauty Collection", "Everyday beauty to professional supplies."],
    [ShieldCheck, "Quality & Trust", "Products selected with care."],
    [ShoppingBag, "Retail + Wholesale", "Solutions for customers and salons."],
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

function VideoExperience() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollReels = (direction: -1 | 1) => {
    sliderRef.current?.scrollBy({
      left: direction * Math.min(sliderRef.current.clientWidth * 0.82, 760),
      behavior: "smooth",
    });
  };
  const reels = [
    {
      title: "Everyday Glow Routine",
      label: "SKINCARE",
      image: cat(1),
      video: "/reels/everyday-glow.mp4",
    },
    {
      title: "Festive Glam Edit",
      label: "MAKEUP",
      image: heroFestive,
      video: "/reels/festive-glam.mp4",
    },
    {
      title: "Discover LGS Care",
      label: "LGS BEAUTY",
      image: lgsCampaign,
      video: "/reels/lgs-care.mp4",
    },
    {
      title: "Perfect Nails",
      label: "NAIL CARE",
      image: cat(2),
      video: "/reels/perfect-nails.mp4",
    },
    {
      title: "Jewellery Styling",
      label: "ACCESSORIES",
      image: cat(5),
      video: "/reels/jewellery-styling.mp4",
    },
    {
      title: "Inside Our Beauty Mall",
      label: "STORE TOUR",
      image: storeInterior,
      video: "/reels/store-tour.mp4",
    },
  ];
  return (
    <section className="bg-[#f5edf0] py-14 sm:py-20">
      <div className="container-lv">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">BEAUTY IN MOTION</p>
            <h2 className="mt-3 text-4xl text-wine sm:text-5xl">Glam in Action</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Watch beauty, products and the Lucky Varieties experience come alive.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
              className="mr-2 inline-flex w-fit items-center gap-2 border-b border-wine pb-2 text-xs font-bold tracking-widest text-wine"
            >
              VIEW ALL REELS <ArrowRight size={15} />
            </a>
            <button
              type="button"
              onClick={() => scrollReels(-1)}
              className="grid size-11 place-items-center border border-wine text-wine transition hover:bg-wine hover:text-white"
              aria-label="Previous reels"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollReels(1)}
              className="grid size-11 place-items-center bg-wine text-white transition hover:bg-wine-deep"
              aria-label="Next reels"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollReels(-1)}
            className="absolute -left-5 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white text-wine shadow-lift transition hover:bg-wine hover:text-white lg:grid"
            aria-label="Scroll reels left"
          >
            <ChevronLeft size={24} />
          </button>
          <div ref={sliderRef} className="swipe-row -mx-4 mt-8 gap-3 px-4 pb-2 sm:mx-0 sm:px-0">
            {reels.map((reel, index) => (
              <a
                href={site.instagram}
                target="_blank"
                rel="noreferrer"
                className="group relative w-[62vw] max-w-[245px] overflow-hidden bg-wine-deep sm:w-[230px]"
                aria-label={`Watch ${reel.title} on Instagram`}
                key={reel.title}
              >
                <div className="aspect-[9/14] overflow-hidden">
                  <video
                    src={reel.video}
                    poster={reel.image}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={`${reel.title} beauty video`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/10" />
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  <Instagram size={12} /> Reel
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-[9px] font-bold tracking-[.18em] text-gold-soft">
                    {reel.label}
                  </p>
                  <h3 className="mt-1 text-xl leading-tight">{reel.title}</h3>
                  <p className="mt-2 flex items-center gap-1 text-[10px] font-bold tracking-wider opacity-75">
                    WATCH NOW <ArrowRight size={12} />
                  </p>
                </div>
                <span
                  className="absolute left-0 top-0 h-1 bg-gold transition-all duration-500 group-hover:w-full"
                  style={{ width: `${22 + index * 8}%` }}
                />
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollReels(1)}
            className="absolute -right-5 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-wine text-white shadow-lift transition hover:bg-wine-deep lg:grid"
            aria-label="Scroll reels right"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
function InstagramBlock() {
  return (
    <Section title="Follow Our Beauty World" sub={site.instagramHandle}>
      <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
        {[storeShelf, heroFestive, cat(0), storeInterior, lgsCampaign, cat(2)].map((im, i) => (
          <a
            href={site.instagram}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden"
            key={i}
          >
            <img
              src={im}
              alt="Lucky Varieties beauty inspiration"
              loading="lazy"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
            <span className="absolute inset-0 grid place-items-center bg-wine/60 text-white opacity-0 transition group-hover:opacity-100">
              <Instagram />
            </span>
          </a>
        ))}
      </div>
    </Section>
  );
}
const cat = (i: number) => categories[i]?.image ?? storeShelf;
function Reviews() {
  return (
    <section className="bg-secondary py-16">
      <div className="container-lv text-center">
        <h2 className="text-4xl text-wine">Loved by Our Customers</h2>
        <p className="mx-auto mt-8 max-w-2xl font-display text-2xl leading-relaxed">
          “A placeholder for a genuine customer story about the in-store selection and helpful
          shopping experience.”
        </p>
        <div className="mt-5 flex justify-center gap-1 text-gold">
          {[1, 2, 3, 4, 5].map((x) => (
            <Star key={x} size={16} className="fill-current" />
          ))}
        </div>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Sample testimonial — replace with verified review
        </p>
      </div>
    </section>
  );
}
function StoreCta() {
  return (
    <section className="container-lv py-16">
      <div className="grid bg-wine text-white lg:grid-cols-2">
        <div className="p-7 sm:p-12">
          <p className="eyebrow !text-gold">COME SAY HELLO</p>
          <h2 className="mt-4 text-5xl">Visit Lucky Varieties Beauty Mall</h2>
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
        <div className="grid min-h-72 place-items-center bg-[radial-gradient(circle_at_center,#8c4050,#4b1521)]">
          <MapPin size={50} className="text-gold" />
          <span className="sr-only">Map area</span>
        </div>
      </div>
    </section>
  );
}
function Newsletter() {
  return (
    <section className="border-t bg-white py-12">
      <div className="container-lv flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <h2 className="text-3xl text-wine">Glow With Us</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            New arrivals, beauty offers and festive collections.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("You're on the list");
          }}
          className="flex w-full max-w-lg"
        >
          <input
            required
            type="email"
            aria-label="Email address"
            placeholder="Your email address"
            className="h-12 min-w-0 flex-1 border px-4 text-sm outline-none focus:border-wine"
          />
          <button className="bg-wine px-5 text-[10px] font-bold tracking-widest text-white">
            SUBSCRIBE
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  const columns = [
    {
      title: "SHOP",
      links: [
        ["Makeup", "/shop/makeup"],
        ["Skincare", "/shop/skincare"],
        ["Nail Care", "/shop/nail-care"],
        ["Hair Accessories", "/shop/hair-accessories"],
        ["Jewellery", "/shop/jewellery"],
        ["LGS Products", "/lgs-products"],
      ],
    },
    {
      title: "DISCOVER",
      links: [
        ["New Arrivals", "/new-arrivals"],
        ["Best Sellers", "/best-sellers"],
        ["Offers", "/offers"],
        ["Gallery", "/gallery"],
        ["About Us", "/about"],
      ],
    },
    {
      title: "HELP",
      links: [
        ["Contact Us", "/contact"],
        ["For Salons", "/for-salons"],
        ["FAQs", "/faqs"],
        ["Shipping Information", "/shipping-information"],
        ["Return Policy", "/return-policy"],
        ["Privacy Policy", "/privacy-policy"],
        ["Terms & Conditions", "/terms-and-conditions"],
      ],
    },
  ] as const;
  return (
    <footer className="overflow-hidden bg-wine-deep text-white">
      <div className="container-lv grid min-w-0 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="font-display text-3xl font-bold tracking-wider">LUCKY</p>
          <p className="mt-3 max-w-[330px] text-sm leading-6 text-white/60 sm:max-w-sm">
            Premium beauty products for everyday glow. Beauty, personal care, jewellery and
            professional salon solutions in Koregaon.
          </p>
          <a
            href={site.instagram}
            className="mt-5 inline-flex items-center gap-2 text-xs text-gold"
          >
            <Instagram size={17} />
            {site.instagramHandle}
          </a>
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
        © {new Date().getFullYear()} Lucky Varieties Beauty Mall. All Rights Reserved.
      </div>
    </footer>
  );
}

export function AccountPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  return (
    <>
      <PageHero
        title={mode === "login" ? "Welcome Back" : "Join Our Beauty World"}
        copy="Save favourites, manage your bag and enjoy a smoother shopping experience."
      />
      <section className="container-lv py-12 sm:py-16">
        <div className="mx-auto max-w-md bg-white p-6 shadow-card sm:p-9">
          <div className="grid grid-cols-2 border-b">
            {(["login", "register"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={`h-12 border-b-2 text-xs font-bold uppercase tracking-widest ${mode === item ? "border-wine text-wine" : "border-transparent text-muted-foreground"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(
                mode === "login" ? "Login demo submitted" : "Registration demo submitted",
                {
                  description: "Connect your authentication backend to activate customer accounts.",
                },
              );
            }}
            className="mt-7 space-y-4"
          >
            {mode === "register" && (
              <CheckoutInput label="Full Name" placeholder="Your full name" />
            )}
            <CheckoutInput label="Email Address" placeholder="you@example.com" type="email" />
            {mode === "register" && (
              <CheckoutInput label="Phone Number" placeholder="10-digit mobile number" type="tel" />
            )}
            <CheckoutInput label="Password" placeholder="Enter your password" type="password" />
            {mode === "login" && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-wine" /> Remember me
                </label>
                <button
                  type="button"
                  onClick={() =>
                    toast.message("Password reset", {
                      description: "Connect email authentication to enable password reset.",
                    })
                  }
                  className="text-wine underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
            <button className="h-13 w-full bg-wine text-xs font-bold uppercase tracking-widest text-white">
              {mode === "login" ? "Login" : "Create Account"}
            </button>
          </form>
          <div className="mt-6 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            SECURE CUSTOMER ACCESS
            <span className="h-px flex-1 bg-border" />
          </div>
          <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
            Shopping as a guest?{" "}
            <a href="/shop" className="font-bold text-wine">
              Continue shopping
            </a>
          </p>
        </div>
      </section>
    </>
  );
}

export function WishlistPage() {
  const { wishlist } = useShop();
  const saved = products.filter((product) => wishlist.includes(product.id));
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
    title: "About Lucky Varieties",
    intro:
      "Your local destination for beauty, personal care and professional salon solutions in Koregaon.",
    sections: [
      {
        heading: "Beauty Under One Roof",
        text: "Lucky Varieties Beauty Mall brings cosmetics, skincare, personal care, imitation jewellery, accessories and professional salon supplies together in one convenient store.",
      },
      {
        heading: "Quality & Trust",
        text: "Our team helps customers explore products for everyday routines, festive looks and professional beauty requirements without making unsupported claims about any product.",
      },
      {
        heading: "Discover LGS",
        text: "LGS is our own growing beauty and skincare range, presented as part of the wider Lucky Varieties experience.",
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
        text: "This frontend currently sends an order enquiry. Our store team confirms stock, delivery and payment details directly with you.",
      },
      {
        heading: "Do you supply salons in bulk?",
        text: "Yes. Visit the For Salons page or WhatsApp us with the product and approximate quantity you need.",
      },
      {
        heading: "Can I collect my order from the store?",
        text: "Yes. Choose store pickup during checkout and our team will confirm when your products are ready.",
      },
    ],
  },
  "shipping-information": {
    title: "Shipping Information",
    intro: "Clear delivery information for Lucky Varieties customers.",
    sections: [
      {
        heading: "Order Confirmation",
        text: "Delivery availability, charges and estimated timing are confirmed by our store team after receiving your order enquiry.",
      },
      {
        heading: "Delivery Area",
        text: "Local and outstation delivery options can vary by product type, order value and destination. Professional equipment may require special handling.",
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
        text: "Checkout and enquiry forms may collect contact and delivery details so the store can respond to your request. Live storage and processing require backend integration.",
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
        text: "Submitting checkout does not create a final paid order until availability, delivery and payment are confirmed by Lucky Varieties Beauty Mall.",
      },
    ],
  },
};

export function InfoPage({ page }: { page: InfoPageKey }) {
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
              heroSalon,
              promo,
              heroGlow,
            ].map((image, index) => (
              <img
                src={image}
                alt={`Lucky Varieties gallery ${index + 1}`}
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
              <div className="flex gap-4 border-b py-4" key={product.id + line.shade}>
                <img src={product.image} alt="" className="size-24 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.shade || product.subtitle.replace("Â·", "·")}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border">
                      <button
                        onClick={() => setQty(product.id, line.qty - 1, line.shade)}
                        className="grid size-8 place-items-center"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-7 text-center text-xs">{line.qty}</span>
                      <button
                        onClick={() => setQty(product.id, line.qty + 1, line.shade)}
                        className="grid size-8 place-items-center"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <b className="text-sm">{formatINR(product.price * line.qty)}</b>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id, line.shade)}
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
  const { searchOpen, setSearchOpen } = useShop();
  const [q, setQ] = useState("");
  const results = useMemo(() => searchProducts(q).slice(0, 6), [q]);
  if (!searchOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ivory">
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
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {results.map((p) => (
              <a href={`/product/${p.slug}`} className="flex gap-3 bg-white p-2" key={p.id}>
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
  const list = filter ? products.filter(filter) : products;
  return (
    <>
      <PageHero title={title} copy={`${list.length} carefully selected beauty essentials`} />
      <div className="container-lv py-10">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <span className="text-xs text-muted-foreground">{list.length} PRODUCTS</span>
          <select className="border bg-white px-3 py-2 text-xs">
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Newest</option>
          </select>
        </div>
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
  return (
    <section className="overflow-hidden bg-wine-deep px-4 py-12 text-center text-white sm:py-20">
      <p className="text-[10px] font-bold uppercase tracking-[.22em] text-gold">
        Lucky Varieties Beauty Mall
      </p>
      <h1 className="mx-auto mt-3 max-w-[340px] text-4xl leading-tight sm:max-w-3xl sm:text-6xl">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-white/65 sm:max-w-xl">
        {copy}
      </p>
    </section>
  );
}
export function ProductPage({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const [qty, setQty] = useState(1),
    [shade, setShade] = useState(product.shades?.[0]?.name),
    [selectedImage, setSelectedImage] = useState(product.image);
  const galleryImages = Array.from(new Set([product.image, product.hoverImage]));
  return (
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
                  className="h-full w-full object-cover"
                  alt={`${product.name} view ${index + 1}`}
                />
              </button>
            ))}
          </div>
          <div className="aspect-[4/5] overflow-hidden bg-secondary">
            <img
              src={selectedImage}
              alt={product.name}
              className="h-full w-full object-cover transition-opacity duration-300"
            />
          </div>
        </div>
        <div className="md:px-2 lg:px-8">
          <p className="eyebrow">{product.brand}</p>
          <h1 className="mt-3 text-3xl leading-tight text-wine min-[390px]:text-4xl md:text-3xl lg:text-5xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Star size={15} className="fill-gold text-gold" />
            {product.rating} ({product.reviews} reviews)
          </div>
          <div className="mt-6 flex items-center gap-3">
            <b className="text-2xl">{formatINR(product.price)}</b>
            <s className="text-muted-foreground">{formatINR(product.mrp)}</s>
            <span className="font-bold text-sale">{discountOf(product)}% OFF</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
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
          <div className="mt-8 flex flex-wrap gap-3 sm:flex-nowrap">
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
              onClick={() => addToCart(product, { qty, shade })}
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
              addToCart(product, { qty, shade });
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
          </div>
        </div>
      </div>
      <div className="mt-10 sm:mt-16">
        <ProductSection
          title="You May Also Like"
          sub="More picks for your routine."
          list={products
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 4)}
        />
      </div>
    </div>
  );
}

export function CheckoutPage() {
  const { lines, subtotal, setQty, removeFromCart } = useShop();
  const delivery = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + delivery;
  const [payment, setPayment] = useState("cod");

  if (lines.length === 0) {
    return (
      <>
        <PageHero title="Your Bag Is Empty" copy="Add a beauty favourite before checking out." />
        <section className="container-lv grid min-h-80 place-items-center py-16 text-center">
          <div>
            <ShoppingBag className="mx-auto size-10 text-wine" />
            <h2 className="mx-auto mt-4 max-w-[320px] text-2xl text-wine min-[390px]:text-3xl">
              Ready for a little beauty shopping?
            </h2>
            <a
              href="/shop"
              className="mt-7 inline-flex h-12 items-center gap-3 bg-wine px-7 text-xs font-bold tracking-widest text-white"
            >
              EXPLORE PRODUCTS <ArrowRight size={15} />
            </a>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero title="Secure Checkout" copy="Complete your order enquiry in just a few steps." />
      <section className="container-lv grid gap-8 py-10 lg:grid-cols-[1fr_420px] lg:py-14">
        <form
          id="checkout-form"
          onSubmit={(event) => {
            event.preventDefault();
            toast.success("Order details received", {
              description: "Our store team will contact you to confirm availability and delivery.",
            });
          }}
          className="space-y-8"
        >
          <div className="bg-white p-5 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-7 place-items-center rounded-full bg-wine text-xs font-bold text-white">
                1
              </span>
              <h2 className="text-2xl text-wine">Contact Information</h2>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <CheckoutInput label="Full Name" placeholder="Your full name" />
              <CheckoutInput label="Phone Number" placeholder="10-digit mobile number" type="tel" />
              <CheckoutInput
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                optional
              />
              <CheckoutInput
                label="WhatsApp Number"
                placeholder="For order updates"
                type="tel"
                optional
              />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-7 place-items-center rounded-full bg-wine text-xs font-bold text-white">
                2
              </span>
              <h2 className="text-2xl text-wine">Delivery Address</h2>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <CheckoutInput label="Address" placeholder="House, building and street" />
              </div>
              <CheckoutInput label="City / Town" placeholder="City" />
              <CheckoutInput label="PIN Code" placeholder="6-digit PIN code" />
              <CheckoutInput label="District" placeholder="District" />
              <CheckoutInput label="State" placeholder="Maharashtra" />
            </div>
            <label className="mt-5 flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" className="size-4 accent-wine" /> Pick up from our Koregaon
              store instead
            </label>
          </div>

          <div className="bg-white p-5 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-7 place-items-center rounded-full bg-wine text-xs font-bold text-white">
                3
              </span>
              <h2 className="text-2xl text-wine">Payment Preference</h2>
            </div>
            <div className="mt-6 space-y-3">
              {(
                [
                  ["cod", "Cash on Delivery", "Pay when your confirmed order arrives"],
                  [
                    "upi",
                    "UPI / Online Payment",
                    "Payment details shared after stock confirmation",
                  ],
                  ["store", "Pay at Store", "Reserve now and pay during pickup"],
                ] as const
              ).map(([value, title, copy]) => (
                <label
                  key={value}
                  className={`flex min-h-16 cursor-pointer items-center gap-4 border p-4 ${payment === value ? "border-wine bg-secondary" : "bg-white"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={payment === value}
                    onChange={() => setPayment(value)}
                    className="size-4 accent-wine"
                  />
                  <span>
                    <b className="block text-sm">{title}</b>
                    <span className="text-xs text-muted-foreground">{copy}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </form>

        <aside className="h-fit bg-white p-5 sm:p-7 lg:sticky lg:top-32">
          <h2 className="text-3xl text-wine">Order Summary</h2>
          <div className="mt-5 max-h-[390px] space-y-4 overflow-y-auto pr-1">
            {lines.map(({ line, product }) => (
              <div
                className="flex gap-3 border-b pb-4"
                key={`${product.id}-${line.shade ?? "default"}`}
              >
                <div className="relative shrink-0">
                  <img src={product.image} alt={product.name} className="size-20 object-cover" />
                  <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-wine text-[10px] text-white">
                    {line.qty}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-display text-lg">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground">{line.shade ?? product.type}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center border">
                      <button
                        type="button"
                        onClick={() => setQty(product.id, line.qty - 1, line.shade)}
                        className="grid size-7 place-items-center"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-[11px]">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(product.id, line.qty + 1, line.shade)}
                        className="grid size-7 place-items-center"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <b className="text-xs">{formatINR(product.price * line.qty)}</b>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id, line.shade)}
                    className="mt-2 text-[10px] underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 border-t pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>{delivery ? formatINR(delivery) : "FREE"}</span>
            </div>
            <div className="flex justify-between border-t pt-4 text-lg">
              <b>Total</b>
              <b>{formatINR(total)}</b>
            </div>
          </div>
          <button
            form="checkout-form"
            type="submit"
            className="mt-6 h-13 w-full bg-wine text-xs font-bold tracking-widest text-white"
          >
            PLACE ORDER ENQUIRY
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-[10px] leading-4 text-muted-foreground">
            <ShieldCheck size={14} /> Product availability and payment are confirmed by the store.
          </p>
        </aside>
      </section>
    </>
  );
}

function CheckoutInput({
  label,
  placeholder,
  type = "text",
  optional = false,
}: {
  label: string;
  placeholder: string;
  type?: string;
  optional?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold">
      {label}
      {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
      <input
        required={!optional}
        type={type}
        placeholder={placeholder}
        className="mt-2 h-12 w-full border bg-ivory px-4 text-sm font-normal outline-none transition focus:border-wine"
      />
    </label>
  );
}
