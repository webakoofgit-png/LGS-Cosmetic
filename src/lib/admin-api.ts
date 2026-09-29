export const ADMIN_API_BASE =
  import.meta.env['VITE_API_URL']?.replace(/\/$/, "") ??
  (import.meta.env.DEV ? "http://localhost:5000" : "");

/** Resolve uploaded backend files while keeping bundled frontend assets local. */
export function resolveImageUrl(value: string | null | undefined) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return value.startsWith("/uploads/") ? `${ADMIN_API_BASE}${value}` : value;
}
