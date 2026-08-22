import catMakeup from "@/assets/cat-makeup.jpg";
import catSkincare from "@/assets/cat-skincare.jpg";
import catNail from "@/assets/cat-nail.jpg";
import catHair from "@/assets/cat-hair.jpg";
import catPersonal from "@/assets/cat-personal.jpg";
import catJewellery from "@/assets/cat-jewellery.jpg";
import catLgs from "@/assets/cat-lgs.jpg";
import catSalon from "@/assets/cat-salon.jpg";
import storeShelf from "@/assets/store-shelf.jpg";
import lgsCampaign from "@/assets/lgs-campaign.jpg";
import heroFestive from "@/assets/hero-festive.jpg";

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  group: "MAKEUP" | "SKINCARE" | "BEAUTY" | "PROFESSIONAL";
  types: string[];
};

export const categories: Category[] = [
  {
    slug: "makeup",
    name: "Makeup",
    tagline: "Face, eyes, lips & tools",
    image: catMakeup,
    group: "MAKEUP",
    types: ["Face", "Eyes", "Lips", "Makeup Tools"],
  },
  {
    slug: "skincare",
    name: "Skincare",
    tagline: "Daily care that shows",
    image: catSkincare,
    group: "SKINCARE",
    types: ["Moisturizers", "Face Care", "Self Care", "LGS Skincare"],
  },
  {
    slug: "nail-care",
    name: "Nail Care",
    tagline: "Colour, care & tools",
    image: catNail,
    group: "BEAUTY",
    types: ["Nail Polish", "Nail Tools", "Nail Care"],
  },
  {
    slug: "hair-accessories",
    name: "Hair & Accessories",
    tagline: "Everyday hair essentials",
    image: catHair,
    group: "BEAUTY",
    types: ["Hair Care", "Hair Accessories", "Combs & Brushes"],
  },
  {
    slug: "personal-care",
    name: "Personal Care",
    tagline: "Body, bath & wellness",
    image: catPersonal,
    group: "BEAUTY",
    types: ["Body Care", "Bath", "Daily Essentials"],
  },
  {
    slug: "jewellery",
    name: "Imitation Jewellery",
    tagline: "Festive & everyday pieces",
    image: catJewellery,
    group: "BEAUTY",
    types: ["Earrings", "Bangles", "Necklace Sets"],
  },
  {
    slug: "lgs-products",
    name: "LGS Products",
    tagline: "Our own beauty range",
    image: catLgs,
    group: "SKINCARE",
    types: ["LGS Skincare", "LGS Body Care"],
  },
  {
    slug: "salon-essentials",
    name: "Salon Essentials",
    tagline: "Professional & wholesale",
    image: catSalon,
    group: "PROFESSIONAL",
    types: ["Salon Equipment", "Salon Chairs", "Hydra Facial Machines", "Wholesale Supplies"],
  },
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  type: string;
  subtitle: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  image: string;
  hoverImage: string;
  shades?: { name: string; hex: string }[];
  tags: ("bestseller" | "new" | "trending" | "offer")[];
  inStock: boolean;
  description: string;
  howToUse: string;
  benefits: string[];
  details: string[];
};

type Seed = Omit<
  Product,
  "id" | "slug" | "description" | "howToUse" | "benefits" | "details" | "inStock"
> &
  Partial<Pick<Product, "inStock" | "description" | "howToUse" | "benefits" | "details">>;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const nudeShades = [
  { name: "Rose Nude", hex: "#c98b84" },
  { name: "Classic Red", hex: "#b4232c" },
  { name: "Wine", hex: "#6d1f2c" },
  { name: "Mauve", hex: "#9c6a75" },
];

const nailShades = [
  { name: "Cherry", hex: "#b01d2e" },
  { name: "Blush", hex: "#e6a7ab" },
  { name: "Maroon", hex: "#5e1622" },
  { name: "Coral", hex: "#e2735c" },
  { name: "Nude", hex: "#d9b9a5" },
];

const seeds: Seed[] = [
  {
    name: "LGS Smooth Moisturizer",
    brand: "LGS",
    category: "lgs-products",
    type: "Moisturizers",
    subtitle: "Daily Moisturizer · 100 ml",
    price: 349,
    mrp: 499,
    rating: 4.7,
    reviews: 24,
    image: catLgs,
    hoverImage: lgsCampaign,
    tags: ["bestseller", "trending"],
  },
  {
    name: "LGS Radiance Face Serum",
    brand: "LGS",
    category: "lgs-products",
    type: "Face Care",
    subtitle: "Brightening Serum · 30 ml",
    price: 549,
    mrp: 749,
    rating: 4.6,
    reviews: 18,
    image: lgsCampaign,
    hoverImage: catLgs,
    tags: ["new", "bestseller"],
  },
  {
    name: "LGS Gentle Face Wash",
    brand: "LGS",
    category: "lgs-products",
    type: "Face Care",
    subtitle: "Everyday Cleanser · 100 ml",
    price: 249,
    mrp: 325,
    rating: 4.5,
    reviews: 31,
    image: catSkincare,
    hoverImage: catLgs,
    tags: ["bestseller"],
  },
  {
    name: "LGS Nourishing Body Lotion",
    brand: "LGS",
    category: "lgs-products",
    type: "LGS Body Care",
    subtitle: "Body Lotion · 200 ml",
    price: 299,
    mrp: 399,
    rating: 4.4,
    reviews: 12,
    image: catPersonal,
    hoverImage: catLgs,
    tags: ["new"],
  },
  {
    name: "Velvet Matte Lipstick",
    brand: "Lucky Varieties",
    category: "makeup",
    type: "Lips",
    subtitle: "Long Wear Lipstick",
    price: 399,
    mrp: 599,
    rating: 4.6,
    reviews: 42,
    image: catMakeup,
    hoverImage: heroFestive,
    shades: nudeShades,
    tags: ["bestseller", "trending"],
  },
  {
    name: "Silk Finish Compact Powder",
    brand: "Lucky Varieties",
    category: "makeup",
    type: "Face",
    subtitle: "Oil Control Compact · 10 g",
    price: 299,
    mrp: 425,
    rating: 4.3,
    reviews: 28,
    image: catMakeup,
    hoverImage: catSkincare,
    tags: ["bestseller"],
  },
  {
    name: "Festive Eyeshadow Palette",
    brand: "Lucky Varieties",
    category: "makeup",
    type: "Eyes",
    subtitle: "12 Shade Palette",
    price: 649,
    mrp: 999,
    rating: 4.5,
    reviews: 19,
    image: heroFestive,
    hoverImage: catMakeup,
    tags: ["new", "offer"],
  },
  {
    name: "Everyday Kajal Stick",
    brand: "Lucky Varieties",
    category: "makeup",
    type: "Eyes",
    subtitle: "Smudge Resistant Kajal",
    price: 149,
    mrp: 199,
    rating: 4.4,
    reviews: 55,
    image: catMakeup,
    hoverImage: heroFestive,
    tags: ["bestseller"],
  },
  {
    name: "Blending Brush Set",
    brand: "Lucky Varieties",
    category: "makeup",
    type: "Makeup Tools",
    subtitle: "Set of 6 Brushes",
    price: 499,
    mrp: 799,
    rating: 4.2,
    reviews: 14,
    image: catHair,
    hoverImage: catMakeup,
    tags: ["trending"],
  },
  {
    name: "Hydrating Day Cream",
    brand: "Lucky Varieties",
    category: "skincare",
    type: "Moisturizers",
    subtitle: "Light Day Cream · 50 g",
    price: 329,
    mrp: 449,
    rating: 4.5,
    reviews: 22,
    image: catSkincare,
    hoverImage: catLgs,
    tags: ["bestseller"],
  },
  {
    name: "Aloe Soothing Gel",
    brand: "Lucky Varieties",
    category: "skincare",
    type: "Self Care",
    subtitle: "Multi Use Gel · 150 ml",
    price: 199,
    mrp: 299,
    rating: 4.6,
    reviews: 37,
    image: catSkincare,
    hoverImage: catPersonal,
    tags: ["trending", "offer"],
  },
  {
    name: "Vitamin C Face Wash",
    brand: "Lucky Varieties",
    category: "skincare",
    type: "Face Care",
    subtitle: "Brightening Cleanser · 100 ml",
    price: 275,
    mrp: 349,
    rating: 4.3,
    reviews: 16,
    image: catSkincare,
    hoverImage: catLgs,
    tags: ["new"],
  },
  {
    name: "Glossy Nail Polish",
    brand: "Lucky Varieties",
    category: "nail-care",
    type: "Nail Polish",
    subtitle: "High Shine · 9 ml",
    price: 99,
    mrp: 149,
    rating: 4.5,
    reviews: 63,
    image: catNail,
    hoverImage: storeShelf,
    shades: nailShades,
    tags: ["bestseller", "trending"],
  },
  {
    name: "Matte Nail Polish Set",
    brand: "Lucky Varieties",
    category: "nail-care",
    type: "Nail Polish",
    subtitle: "Set of 4 Shades",
    price: 349,
    mrp: 499,
    rating: 4.4,
    reviews: 21,
    image: storeShelf,
    hoverImage: catNail,
    shades: nailShades,
    tags: ["new", "offer"],
  },
  {
    name: "Manicure Tool Kit",
    brand: "Lucky Varieties",
    category: "nail-care",
    type: "Nail Tools",
    subtitle: "7 Piece Steel Kit",
    price: 299,
    mrp: 399,
    rating: 4.2,
    reviews: 11,
    image: catNail,
    hoverImage: catHair,
    tags: ["trending"],
  },
  {
    name: "Satin Scrunchie Pack",
    brand: "Lucky Varieties",
    category: "hair-accessories",
    type: "Hair Accessories",
    subtitle: "Pack of 6",
    price: 149,
    mrp: 249,
    rating: 4.4,
    reviews: 26,
    image: catHair,
    hoverImage: catJewellery,
    tags: ["new"],
  },
  {
    name: "Detangling Hair Brush",
    brand: "Lucky Varieties",
    category: "hair-accessories",
    type: "Combs & Brushes",
    subtitle: "Cushion Paddle Brush",
    price: 199,
    mrp: 299,
    rating: 4.3,
    reviews: 18,
    image: catHair,
    hoverImage: catPersonal,
    tags: ["bestseller"],
  },
  {
    name: "Hair Serum & Care Oil",
    brand: "Lucky Varieties",
    category: "hair-accessories",
    type: "Hair Care",
    subtitle: "Frizz Control · 100 ml",
    price: 279,
    mrp: 375,
    rating: 4.5,
    reviews: 20,
    image: catPersonal,
    hoverImage: catHair,
    tags: ["trending"],
  },
  {
    name: "Body Lotion Deep Care",
    brand: "Lucky Varieties",
    category: "personal-care",
    type: "Body Care",
    subtitle: "24H Moisture · 400 ml",
    price: 329,
    mrp: 449,
    rating: 4.4,
    reviews: 33,
    image: catPersonal,
    hoverImage: catSkincare,
    tags: ["bestseller"],
  },
  {
    name: "Handmade Soap Trio",
    brand: "Lucky Varieties",
    category: "personal-care",
    type: "Bath",
    subtitle: "Set of 3 Bars",
    price: 249,
    mrp: 349,
    rating: 4.6,
    reviews: 15,
    image: catPersonal,
    hoverImage: storeShelf,
    tags: ["new", "offer"],
  },
  {
    name: "Kundan Earring Set",
    brand: "Lucky Varieties",
    category: "jewellery",
    type: "Earrings",
    subtitle: "Gold Tone Imitation",
    price: 449,
    mrp: 699,
    rating: 4.7,
    reviews: 29,
    image: catJewellery,
    hoverImage: heroFestive,
    tags: ["bestseller", "trending"],
  },
  {
    name: "Festive Bangle Set",
    brand: "Lucky Varieties",
    category: "jewellery",
    type: "Bangles",
    subtitle: "Set of 12 Bangles",
    price: 399,
    mrp: 599,
    rating: 4.5,
    reviews: 17,
    image: heroFestive,
    hoverImage: catJewellery,
    tags: ["new"],
  },
  {
    name: "Pearl Necklace Set",
    brand: "Lucky Varieties",
    category: "jewellery",
    type: "Necklace Sets",
    subtitle: "Necklace + Earrings",
    price: 899,
    mrp: 1299,
    rating: 4.6,
    reviews: 13,
    image: catJewellery,
    hoverImage: heroFestive,
    tags: ["offer"],
  },
  {
    name: "Professional Salon Chair",
    brand: "Salon Pro",
    category: "salon-essentials",
    type: "Salon Chairs",
    subtitle: "Hydraulic Styling Chair",
    price: 12500,
    mrp: 15900,
    rating: 4.6,
    reviews: 8,
    image: catSalon,
    hoverImage: catSalon,
    tags: ["bestseller"],
  },
  {
    name: "Hydra Facial Machine",
    brand: "Salon Pro",
    category: "salon-essentials",
    type: "Hydra Facial Machines",
    subtitle: "Multi Function Facial System",
    price: 48900,
    mrp: 59900,
    rating: 4.8,
    reviews: 5,
    image: catSalon,
    hoverImage: catSalon,
    tags: ["new", "trending"],
  },
  {
    name: "Facial Steamer Trolley",
    brand: "Salon Pro",
    category: "salon-essentials",
    type: "Salon Equipment",
    subtitle: "Ozone Steamer with Stand",
    price: 6900,
    mrp: 8900,
    rating: 4.4,
    reviews: 6,
    image: catSalon,
    hoverImage: catSalon,
    tags: ["offer"],
  },
  {
    name: "Salon Bulk Waxing Kit",
    brand: "Salon Pro",
    category: "salon-essentials",
    type: "Wholesale Supplies",
    subtitle: "Professional Bulk Pack",
    price: 2499,
    mrp: 3299,
    rating: 4.3,
    reviews: 9,
    image: catSalon,
    hoverImage: catPersonal,
    tags: ["bestseller"],
  },
  {
    name: "Glow Gift Hamper",
    brand: "Lucky Varieties",
    category: "makeup",
    type: "Face",
    subtitle: "Festive Beauty Hamper",
    price: 999,
    mrp: 1499,
    rating: 4.7,
    reviews: 10,
    image: heroFestive,
    hoverImage: catMakeup,
    tags: ["offer", "trending", "new"],
  },
];

export const products: Product[] = seeds.map((s, i) => {
  const cat = categoryBySlug(s.category);
  return {
    ...s,
    id: `lv-${String(i + 1).padStart(3, "0")}`,
    slug: slugify(s.name),
    inStock: s.inStock ?? true,
    description:
      s.description ??
      `${s.name} from ${s.brand}, available at Lucky Varieties Beauty Mall, Koregaon. Part of our ${cat?.name ?? "beauty"} range, selected for everyday use and dependable quality.`,
    howToUse:
      s.howToUse ??
      "Apply as needed on clean skin or the intended area. For external use only. Discontinue use if irritation occurs and consult a professional.",
    benefits: s.benefits ?? [
      "Selected for everyday use",
      "Available for retail and wholesale",
      "In-store assistance for shade and product selection",
    ],
    details: s.details ?? [
      `Category: ${cat?.name ?? "Beauty"}`,
      `Product type: ${s.type}`,
      "Availability: In store at Koregaon, Dist. Satara",
      "Price inclusive of all taxes",
    ],
  };
});

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const byTag = (tag: Product["tags"][number]) => products.filter((p) => p.tags.includes(tag));
export const byCategory = (slug: string) => products.filter((p) => p.category === slug);
export const discountOf = (p: Product) => Math.round(((p.mrp - p.price) / p.mrp) * 100);

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) =>
    [p.name, p.brand, p.type, p.subtitle, p.category].join(" ").toLowerCase().includes(q),
  );
}

export const beautyNeeds = [
  { title: "Everyday Glow", image: catSkincare, to: "/shop/skincare" },
  { title: "Party Ready", image: catMakeup, to: "/shop/makeup" },
  { title: "Skincare Essentials", image: catLgs, to: "/lgs-products" },
  { title: "Perfect Nails", image: catNail, to: "/shop/nail-care" },
  { title: "Hair Essentials", image: catHair, to: "/shop/hair-accessories" },
  { title: "Festive Beauty", image: heroFestive, to: "/shop/jewellery" },
];
