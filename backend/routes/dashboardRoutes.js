import { Router } from "express";
import { Op } from "sequelize";
import { Order, Product } from "../models/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/summary", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [orders, todayOrders, sales, products, stock] = await Promise.all([
      Order.count({ where: { orderStatus: { [Op.ne]: "Cancelled" } } }),
      Order.count({ where: { createdAt: { [Op.gte]: startOfToday }, orderStatus: { [Op.ne]: "Cancelled" } } }),
      Order.sum("totalAmount", { where: { orderStatus: { [Op.ne]: "Cancelled" } } }),
      Product.count(),
      Product.sum("stock"),
    ]);
    res.json({ success: true, data: { totalOrders: orders, todayOrders, totalSales: Number(sales || 0), totalProducts: products, totalStock: Number(stock || 0) } });
  } catch (error) { next(error); }
});

dashboardRoutes.get("/report", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const period = ["week", "month", "year"].includes(String(req.query.period)) ? String(req.query.period) : "month";
    const now = new Date();
    const start = new Date(now);
    if (period === "week") start.setDate(now.getDate() - 6);
    if (period === "month") start.setDate(now.getDate() - 29);
    if (period === "year") start.setMonth(now.getMonth() - 11, 1);
    start.setHours(0, 0, 0, 0);
    const orders = await Order.findAll({ where: { createdAt: { [Op.gte]: start }, orderStatus: { [Op.ne]: "Cancelled" } }, attributes: ["createdAt", "totalAmount"] });
    const buckets = new Map();
    for (const order of orders) {
      const date = new Date(order.createdAt);
      let key;
      if (period === "week") key = date.toISOString().slice(0, 10);
      else if (period === "month") key = date.toISOString().slice(0, 10).slice(0, 7);
      else key = String(date.getUTCFullYear());
      const entry = buckets.get(key) || { period: key, sales: 0, orders: 0 };
      entry.sales += Number(order.totalAmount || 0);
      entry.orders += 1;
      buckets.set(key, entry);
    }
    res.json({ success: true, data: { period, rows: [...buckets.values()].sort((a, b) => a.period.localeCompare(b.period)) } });
  } catch (error) { next(error); }
});
