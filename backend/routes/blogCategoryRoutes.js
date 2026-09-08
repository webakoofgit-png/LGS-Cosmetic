import { Router } from "express";
import { body } from "express-validator";
import { createCrudController } from "../services/crudService.js";
import { BlogCategory } from "../models/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const controller = createCrudController(BlogCategory, {
  searchFields: ["name", "slug", "description"],
});

export const blogCategoryRoutes = Router();

blogCategoryRoutes.get("/", controller.list);
blogCategoryRoutes.get("/:id", controller.getById);
blogCategoryRoutes.post("/", requireAuth, requireAdmin, [body("name").notEmpty(), body("slug").notEmpty()], controller.create);
blogCategoryRoutes.put("/:id", requireAuth, requireAdmin, controller.update);
blogCategoryRoutes.delete("/:id", requireAuth, requireAdmin, controller.remove);
