export const site = {
  name: "Lucky Varieties Beauty Mall",
  shortName: "Lucky Varieties",
  ownBrand: "LGS",
  tagline: "Skin and hair care for your skin",
  address: {
    line1: "Koregaon-Rahimatpur Rd, near Police Station",
    line2: "Koregaon, Maharashtra 415501",
  },
  phones: ["+919860964571"],
  phonesDisplay: ["+91 98609 64571"],
  whatsapp: "919860964571",
  facebook: "https://www.facebook.com/lgscosmetics",
  instagram: "https://www.instagram.com/lgscosmetics/",
  instagramHandle: "@lgscosmetics",
  mapsLink: "https://share.google/6fr8aVZz1wQB4cWsl",
  mapsQuery:
    "Lucky+Varieties+Beauty+Mall,+Koregaon-Rahimatpur+Road,+Near+Police+Station,+Koregaon,+Maharashtra+415501",
} as const;

export const mapsUrl = site.mapsLink;
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
