import { onlinePaymentAvailable, initiatePayment, verifyPayment } from "../services/razorpayService.js";
import { Router } from "express";
import { requireCustomer } from "../middleware/customerAuth.js";
import { Order, OrderItem, OrderEvent } from "../models/index.js";
import { createCustomerOrder, orderError } from "../services/orderService.js";

export const customerRoutes = Router();
customerRoutes.use(requireCustomer);
const includes = [{ model: OrderItem, as: "items" }, { model: OrderEvent, as: "events" }];
const ordered = [["createdAt", "DESC"], [{ model: OrderEvent, as: "events" }, "id", "ASC"]];
customerRoutes.get("/orders", async (req, res, next) => {
  try { res.json({ success: true, data: await Order.findAll({ where: { customerId: req.customer.id }, include: includes, order: ordered }) }); }
  catch (error) { next(error); }
});
customerRoutes.post("/orders", async (req, res, next) => {
  try {
    const created = await createCustomerOrder(req.customer, req.body);
    const order = await Order.findByPk(created.id, { include: includes, order: [[{ model: OrderEvent, as: "events" }, "id", "ASC"]] });
    res.status(201).json({ success: true, data: order });
  } catch (error) { next(error); }
});
customerRoutes.get("/orders/:number", async (req, res, next) => {
  try {
    const order = await Order.findOne({ where: { orderNumber: req.params.number, customerId: req.customer.id }, include: includes, order: [[{ model: OrderEvent, as: "events" }, "id", "ASC"]] });
    if (!order) throw orderError("Order not found.", 404);
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
});
customerRoutes.get("/checkout-options", (_req, res) => {
  res.json({ success: true, data: { onlinePaymentAvailable: onlinePaymentAvailable() } });
});

customerRoutes.post("/orders/:number/payment", async (req, res, next) => { try { res.json({ data: await initiatePayment(req.customer.id, req.params.number) }); } catch (error) { next(error); } });
customerRoutes.post("/orders/:number/verify-payment", async (req, res, next) => { try { await verifyPayment(req.customer.id, req.params.number, req.body); res.json({ success: true }); } catch (error) { next(error); } });
