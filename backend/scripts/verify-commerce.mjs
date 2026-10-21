import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { sequelize } from "../config/database.js";
import { customerPool } from "../config/customer-auth.js";
import { Product, Order, OrderEmail, OrderEvent, OrderItem } from "../models/index.js";
import { updateOrder } from "../services/orderService.js";
import { validSignature, onlinePaymentAvailable } from "../services/razorpayService.js";
import { emailConfigured, processOrderEmails, orderEmailTemplate } from "../services/orderEmailService.js";

if (emailConfigured() || onlinePaymentAvailable()) throw new Error("Run this local verification only while payment and email sending are disabled.");
const base = "http://localhost:5000", users = [], orderIds = [];
let product, originalStock;
async function request(path, cookie, body) {
  const response = await fetch(base + path, { headers: { "Content-Type": "application/json", Origin: "http://localhost:8080", ...(cookie ? { cookie } : {}) }, ...(body ? { method: "POST", body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json(), cookie: response.headers.getSetCookie().map(value => value.split(";")[0]).join("; ") };
}
try {
  product = await Product.findOne({ where: { status: "Active" }, order: [["stock", "DESC"]] });
  assert(product && product.stock > 1); originalStock = product.stock;
  for (let index = 0; index < 2; index++) {
    const email = `lgs-flow-${Date.now()}-${index}@example.invalid`;
    const signup = await request("/api/customer-auth/sign-up/email", null, { name: "Local flow verification", email, password: randomUUID() + "!" });
    assert.equal(signup.status, 200); users.push({ id: signup.data.user.id, cookie: signup.cookie });
    assert.equal((await request("/api/customer-auth/get-session", signup.cookie)).data.user.id, signup.data.user.id);
  }
  const body = { checkoutKey: randomUUID(), name: "Local flow verification", phone: "9000000000", deliveryMode: "Delivery", paymentMethod: "cod", address: { street: "Test only", city: "Koregaon", district: "Satara", state: "Maharashtra", pincode: "415501" }, items: [{ productId: product.id, quantity: 1 }], totalAmount: 1, paymentStatus: "Paid" };
  assert.equal((await request("/api/customer/orders", null, body)).status, 401);
  const placed = await request("/api/customer/orders", users[0].cookie, body);
  assert.equal(placed.status, 201, JSON.stringify(placed.data));
  const order = placed.data.data; orderIds.push(order.id);
  assert.equal(order.paymentStatus, "Awaiting collection"); assert(Number(order.totalAmount) > 1);
  const repeated = await request("/api/customer/orders", users[0].cookie, body); assert.equal(repeated.data.data.id, order.id);
  await product.reload(); assert.equal(product.stock, originalStock - 1);
  assert.equal((await request(`/api/customer/orders/${order.orderNumber}`, users[1].cookie)).status, 404);
  assert.equal((await request("/api/customer/orders", users[0].cookie)).data.data.length, 1);
  assert.equal((await request("/api/orders", users[0].cookie)).status, 401);
  assert.equal((await request("/api/customer/orders", users[0].cookie, { ...body, checkoutKey: randomUUID(), paymentMethod: "upi" })).status, 503);
  assert.equal((await request(`/api/customer/orders/${order.orderNumber}/payment`, users[0].cookie, {})).status, 503);
  await updateOrder(order.id, { orderStatus: "Confirmed" });
  await updateOrder(order.id, { orderStatus: "Processing" });
  await assert.rejects(updateOrder(order.id, { orderStatus: "Shipped" }), /courier/i);
  await updateOrder(order.id, { orderStatus: "Shipped", courierName: "Test courier", trackingNumber: "TEST-ONLY", trackingUrl: "https://example.com/tracking" });
  await updateOrder(order.id, { orderStatus: "Out for delivery" });
  await assert.rejects(updateOrder(order.id, { orderStatus: "Delivered" }), /collected/i);
  await updateOrder(order.id, { orderStatus: "Delivered", paymentStatus: "Paid" });
  const tracked = (await request(`/api/customer/orders/${order.orderNumber}`, users[0].cookie)).data.data;
  assert.equal(tracked.orderStatus, "Delivered"); assert.equal(tracked.events.length, 6); assert.equal(tracked.trackingNumber, "TEST-ONLY");
  await processOrderEmails();
  const emails = await OrderEmail.findAll({ where: { orderId: order.id } });
  assert.equal(emails.length, 6); assert(emails.every(email => email.status === "Queued" && !email.sentAt));
  const cancellable = await request("/api/customer/orders", users[0].cookie, { ...body, checkoutKey: randomUUID() });
  assert.equal(cancellable.status, 201); orderIds.push(cancellable.data.data.id);
  await updateOrder(cancellable.data.data.id, { orderStatus: "Cancelled" });
  await updateOrder(cancellable.data.data.id, { orderStatus: "Cancelled" });
  await product.reload(); assert.equal(product.stock, originalStock - 1);
  assert.equal(await OrderEvent.count({ where: { orderId: cancellable.data.data.id } }), 2);
  for (const status of ["Pending", "Confirmed", "Shipped", "Out for delivery", "Delivered", "Cancelled"]) {
    const template = orderEmailTemplate({ ...order, customerName: '<script>alert("x")</script>', orderStatus: status });
    assert(!template.html.includes("<script>")); assert(template.subject.includes(order.orderNumber));
  }
  const signature = createHmac("sha256", "fixture-secret").update("order_fixture|pay_fixture").digest("hex");
  assert(validSignature("order_fixture|pay_fixture", signature, "fixture-secret")); assert(!validSignature("tampered", signature, "fixture-secret")); assert(!validSignature("x", "invalid", "fixture-secret"));
  console.log("PASS: registration/session, checkout pricing, inventory, idempotency, order ownership, disabled UPI, COD collection, fulfillment/tracking, queued emails, safe templates and signature checks.");
} finally {
  for (const id of orderIds) { await OrderEmail.destroy({ where: { orderId: id } }); await OrderEvent.destroy({ where: { orderId: id } }); await OrderItem.destroy({ where: { orderId: id } }); await Order.destroy({ where: { id } }); }
  if (product && originalStock !== undefined) await product.update({ stock: originalStock });
  for (const user of users) { await customerPool.query("DELETE FROM customer_sessions WHERE userId = ?", [user.id]); await customerPool.query("DELETE FROM customer_accounts WHERE userId = ?", [user.id]); await customerPool.query("DELETE FROM customers WHERE id = ?", [user.id]); }
  await sequelize.close(); await customerPool.end();
}
