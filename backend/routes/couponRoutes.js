import { Router } from "express";
import { Coupon } from "../models/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

export const couponRoutes = Router();

couponRoutes.get("/validate/:code", async (req, res, next) => {
  try {
    const code = String(req.params.code || "").trim().toUpperCase();
    const subtotal = Number(req.query.subtotal || 0);
    const coupon = await Coupon.findOne({ where: { code, status: "Active" } });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid or inactive coupon code." });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return res.status(400).json({ success: false, message: "This coupon has expired." });
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: "This coupon usage limit has been reached." });
    if (subtotal < Number(coupon.minOrderAmount || 0)) return res.status(400).json({ success: false, message: `Minimum order value is ₹${Number(coupon.minOrderAmount).toFixed(0)}.` });
    let discount = coupon.discountType === "fixed" ? Number(coupon.discountValue) : (subtotal * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscount != null) discount = Math.min(discount, Number(coupon.maxDiscount));
    discount = Math.min(Math.max(discount, 0), subtotal);
    return res.json({ success: true, data: { code: coupon.code, discount, discountType: coupon.discountType, discountValue: Number(coupon.discountValue) } });
  } catch (error) { next(error); }
});

couponRoutes.get("/", requireAuth, requireAdmin, async (_req, res, next) => {
  try { res.json({ success: true, data: await Coupon.findAll({ order: [["createdAt", "DESC"]] }) }); } catch (error) { next(error); }
});

couponRoutes.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const payload = { ...req.body, code: String(req.body.code || "").trim().toUpperCase() };
    if (!payload.code || payload.discountValue == null) return res.status(400).json({ success: false, message: "Code and discount value are required." });
    res.status(201).json({ success: true, data: await Coupon.create(payload) });
  } catch (error) { next(error); }
});

couponRoutes.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found." });
    const payload = { ...req.body };
    if (payload.code) payload.code = String(payload.code).trim().toUpperCase();
    await coupon.update(payload);
    res.json({ success: true, data: coupon });
  } catch (error) { next(error); }
});

couponRoutes.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found." });
    await coupon.destroy();
    res.json({ success: true });
  } catch (error) { next(error); }
});
