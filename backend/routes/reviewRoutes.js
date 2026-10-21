import { Router } from "express";
import { Review } from "../models/Review.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

export const reviewRoutes = Router();
function validate(body) {
  const reviewerName = typeof body.reviewerName === "string" ? body.reviewerName.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const rating = Number(body.rating);
  const reviewUrl = typeof body.reviewUrl === "string" ? body.reviewUrl.trim() : "";
  if (!reviewerName || reviewerName.length > 150) throw Object.assign(new Error("Reviewer name is required (up to 150 characters)."), { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw Object.assign(new Error("Rating must be between 1 and 5."), { status: 400 });
  if (text.length > 15000) throw Object.assign(new Error("Review text is too long."), { status: 400 });
  if (!["Published", "Hidden"].includes(body.status)) throw Object.assign(new Error("Choose a valid review status."), { status: 400 });
  if (!["Google", "Customer"].includes(body.source)) throw Object.assign(new Error("Choose a valid review source."), { status: 400 });
  if (reviewUrl) {
    try { if (reviewUrl.length > 1000 || !["https:", "http:"].includes(new URL(reviewUrl).protocol)) throw new Error(); }
    catch { throw Object.assign(new Error("Enter a valid review link."), { status: 400 }); }
  }
  const flags = {};
  for (const field of ["isExcerpt", "isTranslated"]) {
    if (field in body) {
      if (typeof body[field] !== "boolean") throw Object.assign(new Error(`${field} must be true or false.`), { status: 400 });
      flags[field] = body[field];
    }
  }
  return { reviewerName, rating, text, reviewUrl: reviewUrl || null, source: body.source, status: body.status, ...flags };
}

reviewRoutes.get("/", async (_req, res, next) => {
  try { res.json({ success: true, data: await Review.findAll({ where: { status: "Published" }, order: [["id", "ASC"]] }) }); }
  catch (error) { next(error); }
});
reviewRoutes.get("/admin", requireAuth, requireAdmin, async (_req, res, next) => {
  try { res.json({ success: true, data: await Review.findAll({ order: [["id", "DESC"]] }) }); }
  catch (error) { next(error); }
});
reviewRoutes.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await Review.create(validate(req.body)) }); }
  catch (error) { next(error); }
});
reviewRoutes.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const value = validate(req.body);
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    await review.update(value);
    res.json({ success: true, data: review });
  } catch (error) { next(error); }
});
reviewRoutes.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    await review.destroy();
    res.json({ success: true });
  } catch (error) { next(error); }
});
