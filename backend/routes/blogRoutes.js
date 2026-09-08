import { Router } from "express";
import { body } from "express-validator";
import { createCrudController } from "../services/crudService.js";
import { Blog, BlogCategory } from "../models/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const controller = createCrudController(Blog, {
  searchFields: ["title", "slug", "excerpt", "author"],
  includes: [{ model: BlogCategory, as: "category" }],
});

export const blogRoutes = Router();

blogRoutes.get("/", controller.list);
blogRoutes.get("/:id", controller.getById);
blogRoutes.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.single("featuredImage"),
  [body("title").notEmpty(), body("slug").notEmpty()],
  controller.create,
);
blogRoutes.put("/:id", requireAuth, requireAdmin, upload.single("featuredImage"), controller.update);
blogRoutes.delete("/:id", requireAuth, requireAdmin, controller.remove);
