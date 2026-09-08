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
import heroFestive from "@/assets/hero_festive.png";
import lgsSkincareCatalog from "@/assets/products/lgs-brochure/lgs-skincare-facial-catalog.jpeg";
import lgsTreatmentCatalog from "@/assets/products/lgs-brochure/lgs-skincare-treatment-catalog.jpeg";
import lgsHairCatalog from "@/assets/products/lgs-brochure/lgs-hair-care-catalog.jpeg";

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
  {
    slug: "hair-care",
    name: "Hair Care",
    tagline: "Shampoo, conditioner & serums",
    image: catHair,
    group: "SKINCARE",
    types: ["Hair Care"],
  },
  {
    slug: "skin-care",
    name: "Skin Care",
    tagline: "Daily face and skin care",
    image: catSkincare,
    group: "SKINCARE",
    types: ["Skin Care"],
  },
  {
    slug: "treatment-care",
    name: "Treatment Care",
    tagline: "Targeted skin routines",
    image: catSkincare,
    group: "SKINCARE",
    types: ["Treatment Care"],
  },
  {
    slug: "sun-care",
    name: "Sun Care",
    tagline: "Everyday sun protection",
    image: catSkincare,
    group: "SKINCARE",
    types: ["Sun Care"],
  },
  {
    slug: "face-care",
    name: "Face Care",
    tagline: "Gentle cleansing care",
    image: catSkincare,
    group: "SKINCARE",
    types: ["Face Care"],
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
  galleryImages?: string[];
  shades?: { name: string; hex: string }[];
  variants?: { label: string; size?: string; price: number; mrp?: number }[];
  size?: string;
  stock?: number;
  keyIngredients?: string[];
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

const brochureSeeds: Seed[] = [
  { name: "LGS Moisturizer", brand: "LGS", category: "lgs-products", type: "Moisturizers", subtitle: "Daily Moisturizer", price: 299, mrp: 299, image: lgsSkincareCatalog, hoverImage: lgsSkincareCatalog, size: "100 gm", variants: [{ label: "100 gm", size: "100 gm", price: 299 }, { label: "200 gm", size: "200 gm", price: 499 }], tags: ["new"], description: "LGS daily moisturizer for soft, hydrated-looking skin.", howToUse: "Apply gently to clean skin.", benefits: ["Helps moisturize skin."], inStock: true },
  { name: "LGS Anti Blemishing Face Bar", brand: "LGS", category: "lgs-products", type: "Face Care", subtitle: "Anti blemishing face bar", price: 59, mrp: 59, image: lgsSkincareCatalog, hoverImage: lgsSkincareCatalog, size: "25 gm", tags: ["new"], description: "LGS anti blemishing cleansing bar.", howToUse: "Lather with water and rinse.", benefits: ["Gentle daily cleansing."], inStock: true },
  { name: "LGS D-TAN Face Pack", brand: "LGS", category: "lgs-products", type: "Face Care", subtitle: "D-TAN face pack", price: 369, mrp: 369, image: lgsTreatmentCatalog, hoverImage: lgsTreatmentCatalog, size: "100 gm", variants: [{ label: "100 gm", size: "100 gm", price: 369 }, { label: "250 gm", size: "250 gm", price: 699 }], tags: ["new"], description: "LGS D-TAN face pack for salon care.", howToUse: "Apply as directed and rinse.", benefits: ["Helps refresh the look of skin."], inStock: true },
  { name: "LGS Anti Blemish Cream", brand: "LGS", category: "lgs-products", type: "Face Care", subtitle: "Treatment care cream", price: 369, mrp: 369, image: lgsTreatmentCatalog, hoverImage: lgsTreatmentCatalog, size: "50 gm", tags: ["new"], description: "LGS anti blemish cream with neem and aloe vera.", howToUse: "Apply gently to clean skin.", benefits: ["Helps support clear-looking skin."], inStock: true },
  { name: "LGS Under Eye Gel", brand: "LGS", category: "lgs-products", type: "Face Care", subtitle: "Reduces dark circles", price: 369, mrp: 369, image: lgsTreatmentCatalog, hoverImage: lgsTreatmentCatalog, size: "50 gm", tags: ["new"], description: "LGS under eye gel with carrot oil and aloe vera.", howToUse: "Apply carefully around the eye area.", benefits: ["Hydrates the under-eye area."], inStock: true },
  { name: "LGS Acne Pimple Oil Control Cream", brand: "LGS", category: "lgs-products", type: "Face Care", subtitle: "Treatment care cream", price: 369, mrp: 369, image: lgsTreatmentCatalog, hoverImage: lgsTreatmentCatalog, size: "50 gm", tags: ["new"], description: "LGS acne pimple oil control cream with tea tree oil and aloe vera.", howToUse: "Apply gently to clean skin.", benefits: ["Helps control excess oil appearance."], inStock: true },
  { name: "LGS SPF 50 Sunscreen", brand: "LGS", category: "lgs-products", type: "Face Care", subtitle: "Daily sun protection", price: 299, mrp: 299, image: lgsTreatmentCatalog, hoverImage: lgsTreatmentCatalog, size: "100 gm", tags: ["new"], description: "LGS sunscreen for everyday UVA and UVB protection.", howToUse: "Apply before sun exposure and reapply as needed.", benefits: ["Helps protect skin from sun exposure."], inStock: true },
  { name: "LGS Hair Tonic", brand: "LGS", category: "hair-care", type: "Hair Care", subtitle: "Hair tonic", price: 599, mrp: 599, image: lgsHairCatalog, hoverImage: lgsHairCatalog, size: "175 ml", tags: ["new"], description: "LGS hair tonic for regular hair care.", howToUse: "Apply to scalp as directed.", benefits: ["Supports a healthy-looking scalp."], inStock: true },
  { name: "LGS Jasmine Hair Oil", brand: "LGS", category: "hair-care", type: "Hair Care", subtitle: "Jasmine hair oil", price: 299, mrp: 299, image: lgsHairCatalog, hoverImage: lgsHairCatalog, size: "100 ml", tags: ["new"], description: "LGS jasmine hair oil.", howToUse: "Massage into scalp and hair.", benefits: ["Supports regular hair-oiling routines."], inStock: true },
  { name: "LGS Hair Serum", brand: "LGS", category: "hair-care", type: "Hair Care", subtitle: "Vitamin E hair serum", price: 199, mrp: 199, image: lgsHairCatalog, hoverImage: lgsHairCatalog, size: "50 ml", variants: [{ label: "50 ml", size: "50 ml", price: 199 }, { label: "100 ml", size: "100 ml", price: 369 }], tags: ["new"], description: "LGS hair serum with vitamin E.", howToUse: "Apply a small amount to hair lengths.", benefits: ["Helps smooth the look of hair."], inStock: true },
  { name: "LGS Hair Growth Active Serum", brand: "LGS", category: "hair-care", type: "Hair Care", subtitle: "Hair growth active serum", price: 1599, mrp: 1599, image: lgsHairCatalog, hoverImage: lgsHairCatalog, size: "30 ml", tags: ["new"], description: "LGS hair growth active serum.", howToUse: "Apply to scalp as directed.", benefits: ["Supports a healthy-looking hair routine."], inStock: true },
  { name: "LGS Fairness Cream", brand: "LGS", category: "lgs-products", type: "Face Care", subtitle: "Instant skin glow cream", price: 249, mrp: 249, image: lgsHairCatalog, hoverImage: lgsHairCatalog, size: "50 gm", variants: [{ label: "50 gm", size: "50 gm", price: 249 }, { label: "100 gm", size: "100 gm", price: 499 }], tags: ["new"], description: "LGS fairness cream for an even, glowing-looking appearance.", howToUse: "Apply gently to clean skin.", benefits: ["Helps moisturize and brighten the look of skin."], inStock: true },
];

const lgsSeeds: Seed[] = [
  {
    name: "LGS Aloe Vera Shampoo",
    brand: "LGS",
    category: "hair-care",
    type: "Hair Care",
    subtitle: "175 ml",
    price: 369,
    mrp: 369,
    rating: 4.6,
    reviews: 0,
    image: catHair,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "175 ml",
    description:
      "LGS Aloe Vera Shampoo is formulated to help cleanse the hair while supporting soft, healthy-looking and manageable hair.",
    howToUse:
      "Apply shampoo to wet hair, gently massage into the scalp and hair, then rinse thoroughly with water. Repeat if required.",
    benefits: [
      "Helps cleanse the hair and scalp.",
      "Helps maintain softness and smoothness.",
      "Suitable for regular hair-care routines.",
    ],
  },
  {
    name: "LGS Anti-Dandruff Shampoo",
    brand: "LGS",
    category: "hair-care",
    type: "Hair Care",
    subtitle: "175 ml",
    price: 369,
    mrp: 369,
    rating: 4.6,
    reviews: 0,
    image: catHair,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "175 ml",
    description:
      "A hair-cleansing shampoo designed for dandruff-prone hair and scalp. It helps cleanse the scalp while supporting cleaner and healthier-looking hair.",
    howToUse: "Apply to wet hair and scalp. Massage gently, leave for a short time and rinse thoroughly.",
    benefits: [
      "Helps cleanse dandruff-prone scalp.",
      "Helps remove scalp impurities.",
      "Supports clean and manageable hair.",
    ],
  },
  {
    name: "LGS Hair Tonic",
    brand: "LGS",
    category: "hair-care",
    type: "Hair Care",
    subtitle: "175 ml",
    price: 599,
    mrp: 599,
    rating: 4.6,
    reviews: 0,
    image: catHair,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "175 ml",
    description:
      "LGS Hair Tonic is designed as part of a regular hair-care routine to support the appearance and condition of the hair and scalp.",
    howToUse: "Apply the required quantity to the hair/scalp and massage gently as directed.",
    benefits: [
      "Supports scalp and hair care.",
      "Helps maintain healthier-looking hair.",
      "Suitable for regular hair-care routines.",
    ],
  },
  {
    name: "LGS Hair Conditioner",
    brand: "LGS",
    category: "hair-care",
    type: "Hair Care",
    subtitle: "175 ml",
    price: 369,
    mrp: 369,
    rating: 4.6,
    reviews: 0,
    image: catHair,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "175 ml",
    description:
      "A conditioning formula designed to make hair feel softer, smoother and more manageable after shampooing.",
    howToUse:
      "After shampooing, apply conditioner through the hair. Leave for approximately 4 minutes and rinse thoroughly with water.",
    benefits: [
      "Helps soften the hair.",
      "Supports smoother and manageable hair.",
      "Helps improve the feel of dry or rough hair.",
    ],
  },
  {
    name: "LGS Jasmine Hair Oil",
    brand: "LGS",
    category: "hair-care",
    type: "Hair Care",
    subtitle: "100 ml",
    price: 299,
    mrp: 299,
    rating: 4.6,
    reviews: 0,
    image: catHair,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "100 ml",
    description:
      "Jasmine Hair Oil is designed to nourish the hair and scalp as part of a regular hair-care routine.",
    howToUse: "Apply an appropriate amount to the scalp and hair and massage gently.",
    benefits: [
      "Helps nourish the hair.",
      "Supports healthier-looking hair.",
      "Helps maintain the condition of the hair and scalp.",
    ],
  },
  {
    name: "LGS Hair Serum",
    brand: "LGS",
    category: "hair-care",
    type: "Hair Care",
    subtitle: "50 ml / 100 ml",
    price: 199,
    mrp: 369,
    rating: 4.6,
    reviews: 0,
    image: catHair,
    hoverImage: lgsCampaign,
    tags: ["new"],
    variants: [
      { label: "50 ml", size: "50 ml", price: 199, mrp: 199 },
      { label: "100 ml", size: "100 ml", price: 369, mrp: 369 },
    ],
    description:
      "LGS Hair Serum helps enhance the appearance of hair by supporting a smoother, shinier and more manageable finish.",
    howToUse:
      "Take a small amount of serum and apply evenly through the hair, particularly the lengths and ends.",
    benefits: [
      "Helps add shine to the hair.",
      "Helps improve smoothness.",
      "Makes hair easier to manage.",
      "Suitable for finishing your hair-care routine.",
    ],
  },
  {
    name: "LGS Hair Growth Active Serum",
    brand: "LGS",
    category: "hair-care",
    type: "Hair Care",
    subtitle: "30 ml",
    price: 1599,
    mrp: 1599,
    rating: 4.7,
    reviews: 0,
    image: catHair,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "30 ml",
    description:
      "LGS Hair Growth Active Serum is a specialized hair serum designed to support the appearance of stronger and healthier-looking hair.",
    howToUse: "Apply the serum directly to the scalp as directed and massage gently.",
    benefits: [
      "Supports hair-care routines focused on hair growth.",
      "Helps maintain healthier-looking hair.",
      "Designed for targeted scalp application.",
    ],
  },
  {
    name: "LGS Fairness Instant Skin Glow Cream",
    brand: "LGS",
    category: "skin-care",
    type: "Skin Care",
    subtitle: "50 gm / 100 gm",
    price: 249,
    mrp: 499,
    rating: 4.6,
    reviews: 0,
    image: catSkincare,
    hoverImage: lgsCampaign,
    tags: ["new"],
    variants: [
      { label: "50 gm", size: "50 gm", price: 249, mrp: 249 },
      { label: "100 gm", size: "100 gm", price: 499, mrp: 499 },
    ],
    description:
      "LGS Fairness Instant Skin Glow Cream is designed to support brighter, smoother and glowing-looking skin as part of your regular skincare routine.",
    howToUse: "Apply an appropriate amount to clean skin and massage gently until absorbed.",
    benefits: [
      "Helps improve the appearance of skin glow.",
      "Supports brighter-looking skin.",
      "Helps maintain smooth-looking skin.",
    ],
  },
  {
    name: "LGS D-Tan",
    brand: "LGS",
    category: "treatment-care",
    type: "Treatment Care",
    subtitle: "100 gm / 250 gm",
    price: 369,
    mrp: 699,
    rating: 4.6,
    reviews: 0,
    image: catSkincare,
    hoverImage: lgsCampaign,
    tags: ["new"],
    variants: [
      { label: "100 gm", size: "100 gm", price: 369, mrp: 369 },
      { label: "250 gm", size: "250 gm", price: 699, mrp: 699 },
    ],
    description:
      "LGS D-Tan is a treatment-care product designed to help improve the appearance of tanned and dull-looking skin.",
    howToUse:
      "Apply an even layer to clean skin as directed. Leave it on for the recommended duration and remove/rinse gently.",
    benefits: [
      "Helps reduce the appearance of tanning.",
      "Supports brighter-looking skin.",
      "Helps improve dull-looking skin.",
    ],
  },
  {
    name: "LGS Anti-Ageing Cream",
    brand: "LGS",
    category: "treatment-care",
    type: "Treatment Care",
    subtitle: "50 gm",
    price: 369,
    mrp: 369,
    rating: 4.5,
    reviews: 0,
    image: catSkincare,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "50 gm",
    description:
      "LGS Anti-Ageing Cream is formulated to support mature skin and help improve the appearance of visible signs of ageing.",
    howToUse: "Apply to clean skin and massage gently until absorbed.",
    benefits: [
      "Helps improve the appearance of fine lines and wrinkles.",
      "Supports smoother-looking skin.",
      "Helps maintain a youthful-looking complexion.",
    ],
  },
  {
    name: "LGS Anti-Blemish Pigmentation Cream",
    brand: "LGS",
    category: "treatment-care",
    type: "Treatment Care",
    subtitle: "50 gm",
    price: 369,
    mrp: 369,
    rating: 4.5,
    reviews: 0,
    image: catSkincare,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "50 gm",
    keyIngredients: ["Tulsi", "Neem", "Aloe Vera"],
    description:
      "A targeted treatment-care cream formulated for skin affected by the appearance of blemishes and pigmentation.",
    howToUse: "Apply a small amount to clean skin, focusing on the required areas, and massage gently.",
    benefits: [
      "Helps improve the appearance of blemishes.",
      "Helps reduce the visible appearance of pigmentation.",
      "Supports clearer and more even-looking skin.",
    ],
  },
  {
    name: "LGS Under Eye Gel",
    brand: "LGS",
    category: "treatment-care",
    type: "Treatment Care",
    subtitle: "50 gm",
    price: 369,
    mrp: 369,
    rating: 4.5,
    reviews: 0,
    image: catSkincare,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "50 gm",
    keyIngredients: ["Carrot Oil", "Aloe Vera"],
    description:
      "LGS Under Eye Gel is specially formulated for the delicate under-eye area and helps improve the appearance of tired-looking skin around the eyes.",
    howToUse:
      "Take a small quantity and gently apply around the under-eye area. Avoid direct contact with the eyes.",
    benefits: [
      "Helps care for the delicate under-eye area.",
      "Helps improve the appearance of tired-looking eyes.",
      "Supports a fresher-looking eye area.",
    ],
  },
  {
    name: "LGS Acne Pimple Removal Cream",
    brand: "LGS",
    category: "treatment-care",
    type: "Treatment Care",
    subtitle: "50 gm",
    price: 369,
    mrp: 369,
    rating: 4.5,
    reviews: 0,
    image: catSkincare,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "50 gm",
    keyIngredients: ["Tea Tree Oil", "Aloe Vera"],
    description:
      "LGS Acne Pimple Removal Cream is designed as targeted care for acne and pimple-prone skin.",
    howToUse: "Clean the skin thoroughly and apply a small amount to the required area as directed.",
    benefits: [
      "Helps care for acne and pimple-prone skin.",
      "Supports clearer-looking skin.",
      "Designed for targeted skincare application.",
    ],
  },
  {
    name: "LGS Sunscreen Lotion SPF 50",
    brand: "LGS",
    category: "sun-care",
    type: "Sun Care",
    subtitle: "100 gm",
    price: 299,
    mrp: 299,
    rating: 4.6,
    reviews: 0,
    image: catSkincare,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "100 gm",
    description:
      "LGS Sunscreen Lotion SPF 50 helps protect the skin from harmful UVA and UVB rays during sun exposure.",
    howToUse: "Apply evenly to exposed skin before going out in the sun. Reapply when required.",
    benefits: [
      "SPF 50 sun protection.",
      "Helps protect skin from UVA and UVB exposure.",
      "Suitable for use before outdoor activities.",
    ],
  },
  {
    name: "LGS Lemon Face Wash Gel",
    brand: "LGS",
    category: "face-care",
    type: "Face Care",
    subtitle: "100 ml",
    price: 299,
    mrp: 299,
    rating: 4.5,
    reviews: 0,
    image: catSkincare,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "100 ml",
    description:
      "LGS Lemon Face Wash Gel is a refreshing facial cleanser designed to remove everyday dirt and impurities while leaving the skin feeling clean and fresh.",
    howToUse:
      "Wet the face, take a small quantity of face wash and gently massage over the face. Rinse thoroughly with water.",
    benefits: [
      "Helps cleanse dirt and impurities.",
      "Refreshes the skin.",
      "Supports clean and fresh-looking skin.",
    ],
  },
  {
    name: "LGS Neem Face Wash Gel",
    brand: "LGS",
    category: "face-care",
    type: "Face Care",
    subtitle: "100 ml",
    price: 299,
    mrp: 299,
    rating: 4.5,
    reviews: 0,
    image: catSkincare,
    hoverImage: lgsCampaign,
    tags: ["new"],
    size: "100 ml",
    description:
      "LGS Neem Face Wash Gel is designed to cleanse the skin and remove accumulated dirt and impurities for a cleaner, fresher appearance.",
    howToUse:
      "Wet the face, gently massage the face wash over the skin and rinse thoroughly with water.",
    benefits: [
      "Helps cleanse the skin.",
      "Removes everyday dirt and impurities.",
      "Helps maintain fresh and clean-looking skin.",
    ],
  },
];

const normalizeProduct = (s: Seed, i: number): Product => {
  const cat = categoryBySlug(s.category);
  const displayName = s.name.replace(/^LGS\s+/i, "").trim();
  return {
    ...s,
    name: displayName,
    id: `lv-${String(i + 1).padStart(3, "0")}`,
    slug: slugify(displayName),
    inStock: s.inStock ?? true,
    stock: s.stock ?? (s.inStock === false ? 0 : 24),
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
};

// The client brochure contains 23 LGS products. Keep only this production catalog on the storefront.
export const products: Product[] = [...brochureSeeds, ...lgsSeeds.slice(0, 2)].map(normalizeProduct);

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
