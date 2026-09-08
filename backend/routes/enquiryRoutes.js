import { Router } from "express";
import { body } from "express-validator";
import { createCrudController } from "../services/crudService.js";
import { ContactEnquiry } from "../models/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const controller = createCrudController(ContactEnquiry, {
  searchFields: ["name", "email", "phone", "subject", "message", "status"],
});

export const enquiryRoutes = Router();

enquiryRoutes.get("/", requireAuth, requireAdmin, controller.list);
enquiryRoutes.get("/:id", requireAuth, requireAdmin, controller.getById);
enquiryRoutes.post("/", [body("name").notEmpty(), body("message").notEmpty()], controller.create);
enquiryRoutes.put("/:id", requireAuth, requireAdmin, controller.update);
enquiryRoutes.delete("/:id", requireAuth, requireAdmin, controller.remove);
