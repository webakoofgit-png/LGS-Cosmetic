import { emailConfigured } from "../services/orderEmailService.js";
import { Router } from "express";
import { Op } from "sequelize";
import { Order, OrderItem, OrderEvent, OrderEmail } from "../models/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { updateOrder } from "../services/orderService.js";

export const orderRoutes = Router();

orderRoutes.use(requireAuth, requireAdmin);
const include = [{ model: OrderItem, as: "items" }, { model: OrderEvent, as: "events" }, { model: OrderEmail, as: "emails", attributes: ["id", "eventId", "status", "attempts", "sentAt", "lastError"] }];
orderRoutes.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1), limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const q = String(req.query.q || "").trim();
    const where = q ? { [Op.or]: ["orderNumber", "customerName", "email", "phone"].map((field) => ({ [field]: { [Op.like]: `%${q}%` } })) } : {};
    const { rows, count } = await Order.findAndCountAll({ where, include, distinct: true, limit, offset: (page - 1) * limit, order: [["createdAt", "DESC"], [{ model: OrderEvent, as: "events" }, "id", "ASC"]] });
    res.json({ success: true, data: rows, pagination: { page, limit, total: count, totalPages: Math.max(1, Math.ceil(count / limit)) }, notifications: { configured: emailConfigured() } });
  } catch (error) { next(error); }
});
orderRoutes.get("/:id", async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, { include });
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
});
orderRoutes.put("/:id", async (req, res, next) => {
  try { await updateOrder(req.params.id, req.body); res.json({ success: true, data: await Order.findByPk(req.params.id, { include }) }); }
  catch (error) { next(error); }
});
orderRoutes.delete("/:id", (_req, res) => res.status(409).json({ success: false, message: "Cancel an order instead of deleting its payment and tracking history." }));
