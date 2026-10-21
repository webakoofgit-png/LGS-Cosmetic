export const site = {
  name: "LGS Cosmetics",
  shortName: "LGS Cosmetics",
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
  instagram: "https://www.instagram.com/lgs_cosmetics/",
  instagramHandle: "@lgs_cosmetics",
  mapsLink: "https://share.google/YmYaSZZRk0ry1wlFN",
  mapsQuery:
    "LGS+Cosmetics,+Koregaon-Rahimatpur+Road,+Near+Police+Station,+Koregaon,+Maharashtra+415501",
} as const;

export const mapsUrl = site.mapsLink;
export const mapsEmbedUrl = `https://www.google.com/maps?q=${site.mapsQuery}&output=embed`;
export const whatsappUrl = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
  "Hello LGS Cosmetics, I would like to know more about your products.",
)}`;

export const announcements = [
  "Premium Beauty Products in Koregaon",
  "Retail & Wholesale Beauty Solutions",
  "Visit LGS Cosmetics",
  "Skin and Hair Care for Your Everyday Routine",
];

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
