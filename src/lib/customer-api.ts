import { useQuery } from "@tanstack/react-query";
import { ADMIN_API_BASE } from "./admin-api";

export type Customer = { id: string; name: string; email: string };
export type CustomerOrder = {
  id: number; orderNumber: string; customerName: string; email: string; phone: string;
  createdAt: string; updatedAt: string; shippingAddress: string; deliveryMode: string;
  subtotal: number | string; discount: number | string; shippingCharge: number | string; totalAmount: number | string;
  paymentMethod: string; paymentStatus: string; orderStatus: string; courierName?: string; trackingNumber?: string; trackingUrl?: string;
  items: { id: number; productName: string; productImage?: string; variantLabel?: string; price: number | string; quantity: number; total: number | string }[];
  events: { id: number; orderStatus: string; paymentStatus: string; note: string; createdAt: string }[];
  emails?: { id: number; eventId: number; status: string; attempts: number; sentAt?: string; lastError?: string }[];
};

export async function customerRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${ADMIN_API_BASE}${path}`, { credentials: "include", ...(body === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Unable to complete this request.");
  return payload;
}
export function useCustomer() {
  return useQuery({ queryKey: ["customer-session"], queryFn: () => customerRequest<{ user: Customer } | null>("/api/customer-auth/get-session"), staleTime: 30_000, retry: 1 });
}
export function useCustomerOrders(customerId?: string) {
  return useQuery({ queryKey: ["customer-orders", customerId], queryFn: () => customerRequest<{ data: CustomerOrder[] }>("/api/customer/orders"), enabled: Boolean(customerId), refetchInterval: 15_000, refetchOnWindowFocus: true });
}
export const paymentLabel = (method: string) => method === "upi" ? "UPI / Online" : method === "store" ? "Pay at store" : "Cash on Delivery";
export function readableAddress(value: string) { try { return Object.values(JSON.parse(value)).join(", "); } catch { return value; } }
