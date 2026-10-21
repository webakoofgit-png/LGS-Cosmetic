import { useQuery } from "@tanstack/react-query";
import { ADMIN_API_BASE } from "./admin-api";

export const seoDefaults = {
  title: "LGS Cosmetics | Cosmetics Shop in Koregaon",
  description: "Shop beauty, cosmetics, LGS skincare, and personal care at LGS Cosmetics, Koregaon, Satara.",
  keywords: "LGS Cosmetics, skin care, hair care, Koregaon",
  socialTitle: "LGS Cosmetics",
  socialDescription: "Premium beauty products for everyday glow in Koregaon, Satara.",
};
export const editablePages = [
  { path: "/shop", title: "Shop", intro: "Explore beauty essentials from LGS Cosmetics." },
  { path: "/new-arrivals", title: "New Arrivals", intro: "Discover the latest additions to LGS Cosmetics." },
  { path: "/best-sellers", title: "Best Sellers", intro: "Explore our most-loved beauty essentials." },
  { path: "/lgs-products", title: "LGS Products", intro: "Discover skin and hair care from LGS Cosmetics." },
  { path: "/offers", title: "Offers", intro: "Discover our latest beauty offers." },
  { path: "/about", title: "About LGS Cosmetics", intro: "Your local destination for beauty and personal care in Koregaon." },
  { path: "/contact", title: "Visit Our Beauty Mall", intro: "We would love to help you find your next beauty favourite." },
  { path: "/blog", title: "LGS Cosmetics Blog", intro: "Beauty tips, skin and hair care advice, and news from LGS Cosmetics." },
  { path: "/gallery", title: "Beauty Mall Gallery", intro: "A glimpse inside our Koregaon store and collections." },
  { path: "/faqs", title: "Frequently Asked Questions", intro: "Quick answers before you shop or visit our store." },
  { path: "/shipping-information", title: "Shipping Information", intro: "Delivery information for LGS Cosmetics customers." },
  { path: "/return-policy", title: "Cancellation and Return Policy", intro: "Please review our cancellation and return policy." },
  { path: "/privacy-policy", title: "Privacy Policy", intro: "How we handle your personal information." },
  { path: "/terms-and-conditions", title: "Terms and Conditions", intro: "Please review our terms before placing an order." },
];
export type PageContent = { title: string; intro: string; body: string };

export async function readSiteSetting<T>(key: string, signal?: AbortSignal): Promise<T | null> {
  const response = await fetch(`${ADMIN_API_BASE}/api/site-settings/${key}`, signal ? { signal } : {});
  if (!response.ok) throw new Error("Unable to load website settings.");
  const payload = await response.json();
  return payload.data ?? null;
}

export function usePageContent(path: string) {
  const slug = path.replace(/^\/+|\/+$/g, "");
  return useQuery({
    queryKey: ["page-content", slug],
    enabled: editablePages.some((page) => page.path === `/${slug}`),
    queryFn: ({ signal }) => readSiteSetting<PageContent>(`page-${slug}`, signal),
    staleTime: 30_000,
    retry: 1,
  });
}
