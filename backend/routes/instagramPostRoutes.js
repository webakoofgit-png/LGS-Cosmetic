import { Router } from "express";
import { InstagramPost } from "../models/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { Transaction } from "sequelize";
import { saveInstagramPreview } from "../services/instagramPreview.js";

export const instagramPostRoutes = Router();

instagramPostRoutes.get("/", async (_req, res, next) => {
  try {
    const posts = await InstagramPost.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"], ["id", "DESC"]],
      limit: 12,
    });
    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
});

instagramPostRoutes.get("/admin", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    res.json({ success: true, data: await InstagramPost.findAll({ order: [["createdAt", "DESC"], ["id", "DESC"]], limit: 12 }) });
  } catch (error) {
    next(error);
  }
});

instagramPostRoutes.post("/", requireAuth, requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    let link;
    try {
      const url = new URL(String(req.body.link || "").trim());
      if (url.protocol !== "https:" || !["instagram.com", "www.instagram.com"].includes(url.hostname)
        || !/^\/(reel|p|tv)\/[-\w]+\/?$/.test(url.pathname)) throw new Error();
      link = `https://www.instagram.com${url.pathname.replace(/\/$/, "")}/`;
    } catch {
      return res.status(400).json({ success: false, message: "Enter a valid Instagram post or reel link." });
    }
    if (await InstagramPost.count() >= 12) return res.status(400).json({ success: false, message: "Maximum 12 Instagram posts are allowed." });
    let image = req.file ? `/uploads/${req.file.filename}` : null;
    if (!image) {
      try { image = await saveInstagramPreview(link); }
      catch {
        return res.status(422).json({ success: false, message: "Instagram thumbnail could not be fetched. Please try again or upload a thumbnail image." });
      }
    }
    const post = await InstagramPost.sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE }, async (transaction) => {
      if (await InstagramPost.count({ transaction }) >= 12) return null;
      return InstagramPost.create({
      image,
      caption: String(req.body.caption || "").trim() || null,
      link,
      sortOrder: Number(await InstagramPost.max("sortOrder", { transaction }) ?? -1) + 1,
      isActive: true,
      }, { transaction });
    });
    if (!post) return res.status(400).json({ success: false, message: "Maximum 12 Instagram posts are allowed." });
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
