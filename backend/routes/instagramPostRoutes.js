import { Router } from "express";
import { InstagramPost } from "../models/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const instagramPostRoutes = Router();

instagramPostRoutes.get("/", async (_req, res, next) => {
  try {
    const posts = await InstagramPost.findAll({
      where: { isActive: true },
      order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
      limit: 6,
    });
    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
});

instagramPostRoutes.get("/admin", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    res.json({ success: true, data: await InstagramPost.findAll({ order: [["sortOrder", "ASC"], ["createdAt", "DESC"]], limit: 6 }) });
  } catch (error) {
    next(error);
  }
});

instagramPostRoutes.post("/", requireAuth, requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    const count = await InstagramPost.count();
    if (count >= 6) return res.status(400).json({ success: false, message: "Maximum 6 Instagram posts are allowed." });
    if (!req.file) return res.status(400).json({ success: false, message: "Please select an image." });
    const post = await InstagramPost.create({
      image: `/uploads/${req.file.filename}`,
      caption: String(req.body.caption || "").trim() || null,
      link: String(req.body.link || "").trim() || null,
      sortOrder: count,
      isActive: true,
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
});

instagramPostRoutes.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const post = await InstagramPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Instagram post not found." });
    await post.destroy();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
