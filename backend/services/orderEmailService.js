import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
import { OrderEmail } from "../models/index.js";

export const emailConfigured = () => process.env.RESEND_ENABLED === "true" && process.env.RESEND_DOMAIN_VERIFIED === "true" && Boolean(process.env.RESEND_API_KEY && process.env.ORDER_EMAIL_FROM);
const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export function orderEmailTemplate(payload) {
  const titles = { Pending: "Order Placed", Confirmed: "Order Confirmed", Processing: "Preparing Your Order", Shipped: "Order Shipped", "Out for delivery": "Out for Delivery", "Ready for pickup": "Ready for Pickup", Delivered: "Order Delivered", Cancelled: "Order Cancelled" };
  const title = titles[payload.orderStatus] || "Order Update";
  const link = `${(process.env.FRONTEND_URL || "http://localhost:8080").replace(/\/$/, "")}/orders/${encodeURIComponent(payload.orderNumber)}`;
  const text = `Hi ${payload.customerName},\n\n${title}: ${payload.orderNumber}\n${payload.note}\nTotal: INR ${Number(payload.totalAmount).toFixed(2)}\nPayment: ${payload.paymentStatus}${payload.trackingNumber ? `\nCourier: ${payload.courierName}\nTracking / AWB: ${payload.trackingNumber}` : ""}\n\nView your order: ${link}\n\nLGS Cosmetics`;
  return { subject: `${title} — ${payload.orderNumber}`, text, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#29221f"><h2 style="color:#a00000">LGS Cosmetics</h2><h1>${escape(title)}</h1><p>Hi ${escape(payload.customerName)},</p><p>${escape(payload.note)}</p><p>Order: <b>${escape(payload.orderNumber)}</b></p><p>Total: INR ${Number(payload.totalAmount).toFixed(2)}<br>Payment: ${escape(payload.paymentStatus)}</p>${payload.trackingNumber ? `<p>Courier: ${escape(payload.courierName)}<br>Tracking / AWB: ${escape(payload.trackingNumber)}</p>` : ""}<p><a href="${escape(link)}">View order and parcel tracking</a></p><p>Thank you for shopping with LGS Cosmetics.</p></div>` };
}

let running = false;
export async function processOrderEmails() {
  if (running || !emailConfigured()) return;
  running = true;
  try {
    for (let count = 0; count < 20; count++) {
      // Hold the row lock across the bounded API request so multiple workers
      // cannot send the same event concurrently. The provider also deduplicates.
      const found = await sequelize.transaction(async (transaction) => {
        const row = await OrderEmail.findOne({ where: { status: { [Op.in]: ["Queued", "Failed"] }, attempts: { [Op.lt]: 8 }, [Op.or]: [{ nextAttemptAt: null }, { nextAttemptAt: { [Op.lte]: new Date() } }] }, order: [["id", "ASC"]], transaction, lock: transaction.LOCK.UPDATE });
        if (!row) return false;
        // Avoid resending an uncertain request after Resend's 24-hour deduplication window.
        if (row.attempts && Date.now() - new Date(row.firstAttemptAt || row.createdAt).getTime() > 23 * 3600000) {
          await row.update({ status: "Needs review", lastError: "Retry window expired. Check Resend delivery logs before retrying manually." }, { transaction });
          return true;
        }
        if (!row.firstAttemptAt) await row.update({ firstAttemptAt: new Date() }, { transaction });
        try {
          const response = await fetch("https://api.resend.com/emails", { method: "POST", signal: AbortSignal.timeout(15000), headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `lgs-order-event-${row.eventId}` }, body: JSON.stringify({ from: process.env.ORDER_EMAIL_FROM, to: [row.recipient], ...orderEmailTemplate(row.payload) }) });
          const result = await response.json();
          if (!response.ok || !result.id) throw new Error(`Resend did not accept the email (HTTP ${response.status}).`);
          await row.update({ status: "Sent", providerId: result.id, sentAt: new Date(), attempts: row.attempts + 1, lastError: null, nextAttemptAt: null }, { transaction });
        } catch (error) {
          const attempts = row.attempts + 1;
          await row.update({ status: "Failed", attempts, lastError: error.name === "TimeoutError" ? "Resend request timed out; retry scheduled." : "Resend unavailable or rejected the message; check server configuration and provider logs.", nextAttemptAt: new Date(Date.now() + Math.min(3600000, 60000 * 2 ** attempts)) }, { transaction });
        }
        return true;
      });
      if (!found) break;
    }
  } finally { running = false; }
}
export function startOrderEmailWorker() {
  const tick = () => processOrderEmails().catch(() => console.error("Order email worker could not process its queue."));
  const timer = setInterval(tick, 30000); timer.unref(); void tick();
  return timer;
}
