import { createHmac, timingSafeEqual } from "node:crypto";
import { sequelize } from "../config/database.js";
import { Order } from "../models/index.js";
import { orderError, recordOrderEvent } from "./orderService.js";

export const onlinePaymentAvailable = () => process.env.RAZORPAY_ENABLED === "true" && Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET) && (process.env.NODE_ENV !== "production" || process.env.RAZORPAY_KEY_ID.startsWith("rzp_live_"));
export function validSignature(message, signature, secret) {
  if (!secret || typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  return timingSafeEqual(createHmac("sha256", secret).update(message).digest(), Buffer.from(signature, "hex"));
}
async function gateway(path, body) {
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, { method: body ? "POST" : "GET", signal: AbortSignal.timeout(15000), headers: { Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")}`, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (!response.ok) throw orderError("Payment service is unavailable. Your order is saved; please retry from your account.", 502);
  return response.json();
}
export async function initiatePayment(customerId, number) {
  if (!onlinePaymentAvailable()) throw orderError("Online payments are currently disabled.", 503);
  return sequelize.transaction(async (transaction) => {
    const order = await Order.findOne({ where: { customerId, orderNumber: number }, transaction, lock: transaction.LOCK.UPDATE });
    if (!order) throw orderError("Order not found.", 404);
    if (order.paymentMethod !== "upi" || order.orderStatus === "Cancelled" || order.paymentStatus === "Paid") throw orderError("This order cannot accept an online payment.");
    if (!order.gatewayOrderId) {
      const remote = await gateway("orders", { amount: Math.round(Number(order.totalAmount) * 100), currency: "INR", receipt: order.orderNumber, partial_payment: false });
      await order.update({ gatewayOrderId: remote.id }, { transaction });
    }
    return { key: process.env.RAZORPAY_KEY_ID, order_id: order.gatewayOrderId, amount: Math.round(Number(order.totalAmount) * 100), currency: "INR", name: "LGS Cosmetics", prefill: { name: order.customerName, email: order.email, contact: order.phone } };
  });
}
async function applyPayment(payment) {
  return sequelize.transaction(async (transaction) => {
    const order = await Order.findOne({ where: { gatewayOrderId: payment.order_id }, transaction, lock: transaction.LOCK.UPDATE });
    if (!order || order.paymentMethod !== "upi") return;
    if (payment.currency !== "INR" || payment.amount !== Math.round(Number(order.totalAmount) * 100)) throw orderError("Payment amount does not match the order.");
    if (order.paymentStatus === "Paid" || order.paymentStatus === "Refunded") return;
    const status = payment.status === "captured" && payment.captured === true ? "Paid" : payment.status === "failed" ? "Failed" : "Verification pending";
    if (status === order.paymentStatus) return;
    await order.update({ paymentStatus: status, paymentReference: payment.id, ...(status === "Paid" && order.orderStatus === "Pending" ? { orderStatus: "Confirmed" } : {}) }, { transaction });
    await recordOrderEvent(order, status === "Paid" ? (order.orderStatus === "Cancelled" ? "Payment received after cancellation. Contact the store for a refund." : "Payment securely verified and captured by Razorpay.") : `Online payment: ${status}.`, transaction);
  });
}
export async function verifyPayment(customerId, number, body) {
  if (!onlinePaymentAvailable()) throw orderError("Online payments are currently disabled.", 503);
  const order = await Order.findOne({ where: { customerId, orderNumber: number } });
  if (!order || !order.gatewayOrderId) throw orderError("Payment order not found.", 404);
  if (!/^pay_[a-zA-Z0-9]+$/.test(body.razorpay_payment_id || "") || body.razorpay_order_id !== order.gatewayOrderId || !validSignature(`${order.gatewayOrderId}|${body.razorpay_payment_id}`, body.razorpay_signature, process.env.RAZORPAY_KEY_SECRET)) throw orderError("Payment verification failed.");
  const payment = await gateway(`payments/${body.razorpay_payment_id}`);
  if (payment.order_id !== order.gatewayOrderId) throw orderError("Payment does not belong to this order.");
  await applyPayment(payment);
}
export async function razorpayWebhook(req, res, next) {
  try {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) return res.sendStatus(503);
    if (!validSignature(req.body, req.get("x-razorpay-signature"), process.env.RAZORPAY_WEBHOOK_SECRET)) return res.sendStatus(400);
    const event = JSON.parse(req.body.toString("utf8"));
    if (["payment.captured", "payment.failed", "payment.authorized"].includes(event.event)) {
      const payment = event.payload?.payment?.entity;
      if (payment?.id && payment?.order_id) {
        // Fetch authoritative current state so delayed events never downgrade payment.
        await applyPayment(await gateway(`payments/${encodeURIComponent(payment.id)}`));
      }
    }
    res.json({ received: true });
  } catch (error) { next(error); }
}
