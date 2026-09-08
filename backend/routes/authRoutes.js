import { Router } from "express";
import { body } from "express-validator";
import { login, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

export const authRoutes = Router();

authRoutes.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 1 }).withMessage("Password is required"),
  ],
  login,
);

authRoutes.get("/me", requireAuth, me);
