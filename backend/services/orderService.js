import { onlinePaymentAvailable } from "./razorpayService.js";
import { randomUUID } from "node:crypto";
import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
import { Product, Coupon, Order, OrderItem, OrderEvent, OrderEmail } from "../models/index.js";

export const orderStatuses = ["Pending", "Confirmed", "Processing", "Shipped", "Out for delivery", "Ready for pickup", "Delivered", "Cancelled"];
export const paymentStatuses = ["Awaiting payment", "Verification pending", "Awaiting collection", "Pay at store", "Paid", "Failed", "Refunded"];
const transitions = { Pending: ["Confirmed", "Cancelled"], Confirmed: ["Processing", "Cancelled"], Processing: ["Shipped", "Ready for pickup", "Cancelled"], Shipped: ["Out for delivery", "Delivered"], "Out for delivery": ["Delivered"], "Ready for pickup": ["Delivered"], Delivered: [], Cancelled: [] };
export const orderError = (message, status = 400) => Object.assign(new Error(message), { status });
const money = (value) => Math.round(Number(value) * 100);
const decode = (value) => typeof value === "string" ? JSON.parse(value) : value;

export async function recordOrderEvent(order, note, transaction) {
  const event = await OrderEvent.create({ orderId: order.id, orderStatus: order.orderStatus, paymentStatus: order.paymentStatus, note }, { transaction });
  if (order.email) await OrderEmail.create({ eventId: event.id, orderId: order.id, recipient: order.email, payload: {
    orderNumber: order.orderNumber, customerName: order.customerName, orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, totalAmount: order.totalAmount,
    courierName: order.courierName, trackingNumber: order.trackingNumber, trackingUrl: order.trackingUrl, note,
  } }, { transaction });
  return event;
}

export async function createCustomerOrder(customer, body) {
  if (typeof body.checkoutKey !== "string" || !/^[a-f0-9-]{36}$/i.test(body.checkoutKey)) throw orderError("Invalid checkout request. Please refresh and try again.");
  if (!["cod", "upi", "store"].includes(body.paymentMethod)) throw orderError("Choose a valid payment method.");
  if (body.paymentMethod === "upi" && !onlinePaymentAvailable()) throw orderError("Online payment is temporarily unavailable. Please choose cash on delivery or store pickup.", 503);
  if (!["Delivery", "Pickup"].includes(body.deliveryMode)) throw orderError("Choose delivery or store pickup.");
  if (body.paymentMethod === "store" && body.deliveryMode !== "Pickup") throw orderError("Pay at store requires store pickup.");
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 50) throw orderError("Add between 1 and 50 items to your bag.");
  const name = String(body.name || "").trim(), phone = String(body.phone || "").replace(/[\s()-]/g, "");
  if (!name || name.length > 120 || !/^\+?\d{10,15}$/.test(phone)) throw orderError("Enter your name and a valid phone number.");
  const address = {};
  for (const field of ["street", "city", "district", "state", "pincode"]) {
    address[field] = typeof body.address?.[field] === "string" ? body.address[field].trim() : "";
    if (address[field].length > 250 || (body.deliveryMode === "Delivery" && !address[field])) throw orderError("Complete your delivery address.");
  }
  if (body.deliveryMode === "Delivery" && !/^[1-9]\d{5}$/.test(address.pincode)) throw orderError("Enter a valid 6-digit PIN code.");
  const items = body.items.map((item) => {
    if (!Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 || (item.variant && (typeof item.variant !== "string" || item.variant.length > 120))) throw orderError("Invalid product quantity or variant.");
    return { productId: item.productId, quantity: item.quantity, variant: item.variant || null };
  });
  const key = `${customer.id}:${body.checkoutKey}`;
  const previous = await Order.findOne({ where: { checkoutKey: key } });
  if (previous) return previous;
  try { return await sequelize.transaction(async (transaction) => {
    const products = await Product.findAll({ where: { id: { [Op.in]: [...new Set(items.map((item) => item.productId))] } }, transaction, lock: transaction.LOCK.UPDATE, order: [["id", "ASC"]] });
    // A second request may have waited for the same inventory locks.
    const existing = await Order.findOne({ where: { checkoutKey: key }, transaction });
    if (existing) return existing;
    const quantities = new Map(), snapshots = []; let subtotal = 0;
    for (const item of items) {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product || product.status !== "Active") throw orderError("One of the products is no longer available.");
      let variants;
      try { variants = decode(product.variants) || []; } catch { throw orderError("Product options could not be loaded."); }
      if (!Array.isArray(variants)) throw orderError("Invalid product options.");
      const variant = item.variant ? variants.find((entry) => entry.label === item.variant) : variants[0];
      if (item.variant && !variant) throw orderError(`Choose an available option for ${product.name}.`);
      const price = money(variant?.price ?? product.salePrice ?? product.price);
      if (!Number.isSafeInteger(price) || price < 0) throw orderError("Product pricing is unavailable.");
      const quantity = (quantities.get(product.id) || 0) + item.quantity;
      if (quantity > product.stock) throw orderError(`Only ${product.stock} units of ${product.name} are available.`, 409);
      quantities.set(product.id, quantity);
      subtotal += price * item.quantity;
      snapshots.push({ productId: product.id, productName: product.name, productImage: product.mainImage, variantLabel: variant?.label || null, price: price / 100, quantity: item.quantity, total: price * item.quantity / 100 });
    }
    let discount = 0, coupon = null;
    if (body.couponCode) {
      coupon = await Coupon.findOne({ where: { code: String(body.couponCode).trim().toUpperCase(), status: "Active" }, transaction, lock: transaction.LOCK.UPDATE });
      if (!coupon || (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) || (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) || subtotal < money(coupon.minOrderAmount)) throw orderError("Coupon is invalid, expired or does not meet the minimum order amount.");
      discount = coupon.discountType === "fixed" ? money(coupon.discountValue) : Math.round(subtotal * Number(coupon.discountValue) / 100);
      if (coupon.maxDiscount != null) discount = Math.min(discount, money(coupon.maxDiscount));
      discount = Math.min(subtotal, Math.max(0, discount));
      await coupon.increment("usedCount", { transaction });
    }
    const shipping = body.deliveryMode === "Pickup" || subtotal >= 99900 ? 0 : 7900;
    const order = await Order.create({ customerId: customer.id, checkoutKey: key, orderNumber: `LGS-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`,
      customerName: name, email: customer.email, phone, shippingAddress: body.deliveryMode === "Pickup" ? "Store pickup" : JSON.stringify(address), deliveryMode: body.deliveryMode,
      subtotal: subtotal / 100, discount: discount / 100, shippingCharge: shipping / 100, totalAmount: (subtotal - discount + shipping) / 100,
      couponCode: coupon?.code || null, paymentMethod: body.paymentMethod, paymentStatus: body.paymentMethod === "upi" ? "Awaiting payment" : body.paymentMethod === "store" ? "Pay at store" : "Awaiting collection", orderStatus: "Pending",
    }, { transaction });
    await OrderItem.bulkCreate(snapshots.map((item) => ({ ...item, orderId: order.id })), { transaction });
    for (const product of products) await product.decrement("stock", { by: quantities.get(product.id), transaction });
    await recordOrderEvent(order, "Order placed. The store will confirm your order shortly.", transaction);
    return order;
  }); } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") { const duplicate = await Order.findOne({ where: { checkoutKey: key } }); if (duplicate) return duplicate; }
    throw error;
  }
}

export async function updateOrder(id, body) {
  return sequelize.transaction(async (transaction) => {
    const order = await Order.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!order) throw orderError("Order not found.", 404);
    const status = body.orderStatus || order.orderStatus;
    const requestedPayment = body.paymentStatus || order.paymentStatus;
    const payment = requestedPayment === "Pending" && order.paymentStatus === "Pending" ? (order.paymentMethod === "upi" ? "Awaiting payment" : order.paymentMethod === "store" ? "Pay at store" : "Awaiting collection") : requestedPayment;
    if (!orderStatuses.includes(status) || !paymentStatuses.includes(payment)) throw orderError("Choose a valid order and payment status.");
    if (order.paymentMethod === "upi" && payment !== order.paymentStatus) throw orderError("Online payment status must be verified by the payment gateway.");
    if (status !== order.orderStatus && !(transitions[order.orderStatus] || []).includes(status)) throw orderError(`Cannot change ${order.orderStatus} to ${status}.`);
    if (order.orderStatus === "Cancelled" && payment !== order.paymentStatus && payment !== "Refunded") throw orderError("Cancelled orders can only be marked refunded.");
    const allowedPayments = order.paymentMethod === "upi" ? ["Awaiting payment", "Verification pending", "Paid", "Failed", "Refunded"] : order.paymentMethod === "store" ? ["Pay at store", "Paid", "Refunded"] : ["Awaiting collection", "Paid", "Refunded"];
    if (!allowedPayments.includes(payment)) throw orderError("This payment status does not match the payment method.");
    if (order.paymentStatus === "Paid" && !["Paid", "Refunded"].includes(payment)) throw orderError("A collected payment cannot be changed back to unpaid.");
    if (payment === "Refunded" && !["Paid", "Refunded"].includes(order.paymentStatus)) throw orderError("Only a collected payment can be refunded.");
    if (order.deliveryMode === "Pickup" && ["Shipped", "Out for delivery"].includes(status)) throw orderError("Use Ready for pickup for store pickup orders.");
    if (order.deliveryMode !== "Pickup" && status === "Ready for pickup") throw orderError("This order needs delivery.");
    if (["Shipped", "Out for delivery", "Ready for pickup", "Delivered"].includes(status) && order.paymentMethod === "upi" && payment !== "Paid") throw orderError("Verify the UPI payment before dispatching this order.");
    if (status === "Delivered" && payment !== "Paid") throw orderError("Confirm payment was collected before marking the order delivered.");
    const details = {};
    for (const [field, max] of Object.entries({ courierName: 100, trackingNumber: 150, trackingUrl: 1000 })) {
      const value = body[field] === undefined ? (order[field] || "") : body[field];
      if (typeof value !== "string" || value.length > max) throw orderError("Invalid courier details.");
      details[field] = value.trim() || null;
    }
    if (details.trackingUrl) { try { if (!/^https?:$/.test(new URL(details.trackingUrl).protocol)) throw Error(); } catch { throw orderError("Enter a valid courier tracking link."); } }
    if (["Shipped", "Out for delivery"].includes(status) && (!details.courierName || !details.trackingNumber)) throw orderError("Enter the courier name and tracking/AWB number before shipping.");
    const changed = status !== order.orderStatus || payment !== order.paymentStatus || Object.entries(details).some(([field, value]) => (order[field] || null) !== value);
    if (!changed) return order;
    if (status === "Cancelled" && !order.stockReleased && order.customerId) {
      const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction });
      for (const item of items.sort((a, b) => a.productId - b.productId)) if (item.productId) await Product.increment("stock", { by: item.quantity, where: { id: item.productId }, transaction });
      order.stockReleased = true;
    }
    await order.update({ ...details, orderStatus: status, paymentStatus: payment, stockReleased: order.stockReleased }, { transaction });
    await recordOrderEvent(order, `${status}. ${payment === "Paid" ? "Payment received." : payment === "Refunded" ? "Payment refunded." : "Payment: " + payment + "."}`, transaction);
    return order;
  });
}
