export const site = {
  name: "Lucky Varieties Beauty Mall",
  shortName: "Lucky Varieties",
  ownBrand: "LGS",
  tagline: "Premium beauty products for everyday glow",
  address: {
    line1: "Rahimatpur Road, Near Bank of India",
    line2: "Koregaon, Dist. Satara, Maharashtra",
  },
  phones: ["+917507055139", "+919067634555"],
  phonesDisplay: ["+91 75070 55139", "+91 90676 34555"],
  whatsapp: "917507055139",
  instagram: "https://www.instagram.com/lucky_varieties_beauty_mall?igsi=MTl2a3JjMzhmaXli",
  instagramHandle: "@lucky_varieties_beauty_mall",
  mapsQuery:
    "Lucky+Varieties+Beauty+Mall,+Rahimatpur+Road,+Near+Bank+of+India,+Koregaon,+Satara,+Maharashtra",
} as const;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${site.mapsQuery}`;
export const mapsEmbedUrl = `https://www.google.com/maps?q=${site.mapsQuery}&output=embed`;
export const whatsappUrl = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
  "Hello Lucky Varieties Beauty Mall, I would like to know more about your products.",
)}`;

export const announcements = [
  "Premium Beauty Products in Koregaon",
  "Retail & Wholesale Beauty Solutions",
  "Visit Lucky Varieties Beauty Mall",
  "Salon Equipment & Professional Beauty Products Available",
];

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
