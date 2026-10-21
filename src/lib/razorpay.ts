import { customerRequest } from "./customer-api";

let loading: Promise<void> | undefined;
export async function payForOrder(number: string) {
  const { data } = await customerRequest<{ data: Record<string, unknown> }>(`/api/customer/orders/${encodeURIComponent(number)}/payment`, {});
  const browser = window as typeof window & { Razorpay?: new (options: Record<string, unknown>) => { open(): void } };
  if (!browser.Razorpay) {
    loading ??= new Promise<void>((resolve, reject) => {
      const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(); script.onerror = () => { loading = undefined; reject(new Error("Payment checkout could not load. Please retry.")); }; document.head.appendChild(script);
    });
    await loading;
  }
  if (!browser.Razorpay) throw new Error("Payment checkout is unavailable.");
  await new Promise<void>((resolve, reject) => {
    const checkout = new browser.Razorpay!({ ...data,
      handler: async (response: unknown) => { try { await customerRequest(`/api/customer/orders/${encodeURIComponent(number)}/verify-payment`, response); resolve(); } catch (error) { reject(error); } },
      modal: { ondismiss: () => reject(new Error("Payment was not completed. Your order is saved and you can retry from your account.")) },
    }); checkout.open();
  });
}
