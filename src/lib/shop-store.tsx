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
import { products, type Product } from "@/data/catalog";

export type CartLine = { id: string; qty: number; shade?: string | undefined };

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  addToCart: (
    product: Product,
    opts?: { qty?: number; shade?: string | undefined; silent?: boolean },
  ) => void;
  removeFromCart: (id: string, shade?: string | undefined) => void;
  setQty: (id: string, qty: number, shade?: string | undefined) => void;
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
      const idx = prev.findIndex((l) => l.id === product.id && l.shade === opts?.shade);
      const existing = prev[idx];
      if (existing) {
        const next = [...prev];
        next[idx] = { ...existing, qty: existing.qty + qty };
        return next;
      }
      return [...prev, { id: product.id, qty, shade: opts?.shade }];
    });
    if (!opts?.silent) toast.success("Added to bag", { description: product.name });
  }, []);

  const removeFromCart = useCallback((id: string, shade?: string | undefined) => {
    setCart((prev) => prev.filter((l) => !(l.id === id && l.shade === shade)));
  }, []);

  const setQty = useCallback((id: string, qty: number, shade?: string | undefined) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.id === id && l.shade === shade))
        : prev.map((l) => (l.id === id && l.shade === shade ? { ...l, qty } : l)),
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
      .map((line) => ({ line, product: products.find((p) => p.id === line.id)! }))
      .filter((l) => Boolean(l.product));
    return {
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
      subtotal: lines.reduce((n, l) => n + l.product.price * l.line.qty, 0),
      lines,
    };
  }, [cart, wishlist, cartOpen, searchOpen, addToCart, removeFromCart, setQty, toggleWishlist]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
