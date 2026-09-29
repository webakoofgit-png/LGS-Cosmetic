import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { type Product } from "@/data/catalog";
import { ADMIN_API_BASE, resolveImageUrl } from "@/lib/admin-api";

export type CartLine = { id: string; qty: number; shade?: string | undefined; variant?: string | undefined };

type ShopState = {
  adminProducts: Product[];
  catalogError: boolean;
  catalogProducts: Product[];
  cart: CartLine[];
  wishlist: string[];
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  addToCart: (
    product: Product,
    opts?: { qty?: number; shade?: string | undefined; variant?: string | undefined; silent?: boolean },
  ) => void;
  removeFromCart: (id: string, shade?: string | undefined, variant?: string | undefined) => void;
  setQty: (id: string, qty: number, shade?: string | undefined, variant?: string | undefined) => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
  cartCount: number;
  subtotal: number;
  lines: { line: CartLine; product: Product }[];
};

const ShopContext = createContext<ShopState | null>(null);

const CART_KEY = "lv-cart";
const WISH_KEY = "lv-wishlist";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [catalogError, setCatalogError] = useState(false);
  const catalogProducts = adminProducts;

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      const data = [];
      for (let page = 1; ; page += 1) {
        const response = await fetch(`${ADMIN_API_BASE}/api/products?limit=100&page=${page}`);
        if (!response.ok) throw new Error("Unable to load products");
        const payload = await response.json();
        if (!Array.isArray(payload?.data)) throw new Error("Invalid products response");
        data.push(...payload.data);
        if (page >= (payload.pagination?.totalPages ?? 1)) break;
      }
      return { data };
    }
    loadProducts()
      .then((payload) => {
        if (!active || !Array.isArray(payload?.data)) return;
        setAdminProducts(payload.data.filter((item) => item.status === "Active").map(toStoreProduct));
      })
      .catch(() => { if (active) setCatalogError(true); })
      .finally(() => {
        if (active) setCatalogReady(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY);
      const w = localStorage.getItem(WISH_KEY);
      if (c) setCart(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
    } catch {
      /* ignore */
    }
  }, [wishlist]);

  const addToCart = useCallback<ShopState["addToCart"]>((product, opts) => {
    const qty = opts?.qty ?? 1;
    setCart((prev) => {
      const idx = prev.findIndex(
        (l) => l.id === product.id && l.shade === opts?.shade && l.variant === opts?.variant,
      );
      const existing = prev[idx];
      if (existing) {
        const next = [...prev];
        next[idx] = { ...existing, qty: existing.qty + qty };
        return next;
      }
      return [...prev, { id: product.id, qty, shade: opts?.shade, variant: opts?.variant }];
    });
    if (!opts?.silent) toast.success("Added to bag", { description: product.name });
  }, []);

  const removeFromCart = useCallback((id: string, shade?: string | undefined, variant?: string | undefined) => {
    setCart((prev) => prev.filter((l) => !(l.id === id && l.shade === shade && l.variant === variant)));
  }, []);

  const setQty = useCallback((id: string, qty: number, shade?: string | undefined, variant?: string | undefined) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.id === id && l.shade === shade && l.variant === variant))
        : prev.map((l) => (l.id === id && l.shade === shade && l.variant === variant ? { ...l, qty } : l)),
    );
  }, []);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      const has = prev.includes(product.id);
      toast[has ? "message" : "success"](has ? "Removed from wishlist" : "Saved to wishlist", {
        description: product.name,
      });
      return has ? prev.filter((x) => x !== product.id) : [...prev, product.id];
    });
  }, []);

  const value = useMemo<ShopState>(() => {
    const lines = cart
      .map((line) => ({ line, product: catalogProducts.find((p) => p.id === line.id)! }))
      .filter((l) => Boolean(l.product));
    return {
      adminProducts,
      catalogProducts,
      catalogError,
      cart,
      wishlist,
      cartOpen,
      searchOpen,
      setCartOpen,
      setSearchOpen,
      addToCart,
      removeFromCart,
      setQty,
      toggleWishlist,
      isWishlisted: (id: string) => wishlist.includes(id),
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => {
        const linePrice =
          l.product.variants?.find((v) => v.label === l.line.variant)?.price ?? l.product.price;
        return n + linePrice * l.line.qty;
      }, 0),
      lines,
    };
  }, [cart, wishlist, cartOpen, searchOpen, adminProducts, catalogProducts, catalogError, addToCart, removeFromCart, setQty, toggleWishlist]);

  return <ShopContext.Provider value={value}>{catalogReady ? children : <div className="grid min-h-screen place-items-center bg-[#f7f4ef] text-sm text-stone-500">Loading store...</div>}</ShopContext.Provider>;
}

function toStoreProduct(remote: any): Product {
  const image = resolveImageUrl(remote.mainImage) || "/placeholder.svg";
  const galleryImages = parseRemoteList(remote.additionalImages).map(resolveImageUrl);
  const variants = parseRemoteJson(remote.variants);
  return {
    id: `admin-${remote.id}`, slug: remote.slug, name: remote.name,
    brand: remote.brand ?? "", category: remote.category?.slug ?? "",
    type: remote.type ?? "", subtitle: remote.subtitle ?? remote.shortDescription ?? "",
    price: Number(remote.salePrice ?? remote.price), mrp: Number(remote.price),
    rating: Number(remote.rating ?? 0), reviews: Number(remote.reviews ?? 0),
    image, hoverImage: galleryImages[0] || image, galleryImages,
    variants: Array.isArray(variants) ? variants : [], size: remote.size ?? "",
    stock: Number(remote.stock), inStock: Number(remote.stock) > 0,
    tags: parseRemoteList(remote.tags).filter((tag): tag is Product["tags"][number] =>
      ["bestseller", "new", "trending", "offer"].includes(tag)),
    description: remote.description ?? "", howToUse: remote.usage ?? "",
    benefits: parseRemoteList(remote.benefits), keyIngredients: parseRemoteList(remote.ingredients),
    details: [],
  };
}

function parseRemoteList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return value.split("\n").map((item) => item.trim()).filter(Boolean);
  }
}

function parseRemoteJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return value; }
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
