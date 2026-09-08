import { Router } from "express";
import { body } from "express-validator";
import { createCrudController } from "../services/crudService.js";
import { ProductCategory } from "../models/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const controller = createCrudController(ProductCategory, {
  searchFields: ["name", "slug", "description", "group"],
});

export const productCategoryRoutes = Router();

productCategoryRoutes.get("/", controller.list);
productCategoryRoutes.get("/:id", controller.getById);
productCategoryRoutes.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  [body("name").notEmpty(), body("slug").notEmpty()],
  controller.create,
);
productCategoryRoutes.put("/:id", requireAuth, requireAdmin, upload.single("image"), controller.update);
productCategoryRoutes.delete("/:id", requireAuth, requireAdmin, controller.remove);
