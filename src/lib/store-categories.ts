import { useQuery } from "@tanstack/react-query";
import { categories as defaults, type Category } from "@/data/catalog";
import { ADMIN_API_BASE, resolveImageUrl } from "./admin-api";

type RemoteCategory = { slug: string; name: string; description?: string; image?: string; group?: string; types?: string[]; status: string };

export function useStoreCategories() {
  return useQuery({
    queryKey: ["store-categories"],
    staleTime: 30_000,
    queryFn: async ({ signal }) => {
      const items: RemoteCategory[] = [];
      for (let page = 1; ; page++) {
        const response = await fetch(`${ADMIN_API_BASE}/api/product-categories?limit=100&page=${page}`, { signal });
        if (!response.ok) throw new Error("Unable to load categories");
        const payload = await response.json();
        if (!Array.isArray(payload.data)) throw new Error("Invalid categories response");
        items.push(...payload.data);
        if (page >= (payload.pagination?.totalPages ?? 1)) break;
      }
      return items.filter((item) => item.status === "Active").map((item): Category => {
        const fallback = defaults.find((category) => category.slug === item.slug);
        return {
          slug: item.slug, name: item.name, tagline: item.description ?? "",
          image: resolveImageUrl(item.image) || fallback?.image || "/placeholder.svg",
          group: item.group === "MAKEUP" || item.group === "SKINCARE" ? item.group : "BEAUTY",
          types: Array.isArray(item.types) ? item.types : [],
        };
      });
    },
  });
}
