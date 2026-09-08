import { Router } from "express";
import { body } from "express-validator";
import { createCrudController } from "../services/crudService.js";
import { Order, OrderItem } from "../models/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const controller = createCrudController(Order, {
  searchFields: ["orderNumber", "customerName", "email", "phone", "paymentMethod", "orderStatus", "paymentStatus"],
  includes: [{ model: OrderItem, as: "items" }],
});

export const orderRoutes = Router();

orderRoutes.get("/", requireAuth, requireAdmin, controller.list);
orderRoutes.get("/:id", requireAuth, requireAdmin, controller.getById);
orderRoutes.post("/", [body("orderNumber").notEmpty(), body("customerName").notEmpty()], controller.create);
orderRoutes.put("/:id", requireAuth, requireAdmin, controller.update);
orderRoutes.delete("/:id", requireAuth, requireAdmin, controller.remove);
