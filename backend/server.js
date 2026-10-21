import { razorpayWebhook } from "./services/razorpayService.js";
import { startOrderEmailWorker } from "./services/orderEmailService.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDatabase } from "./config/database.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { authRoutes } from "./routes/authRoutes.js";
import { productRoutes } from "./routes/productRoutes.js";
import { productCategoryRoutes } from "./routes/productCategoryRoutes.js";
import { blogRoutes } from "./routes/blogRoutes.js";
import { blogCategoryRoutes } from "./routes/blogCategoryRoutes.js";
import { orderRoutes } from "./routes/orderRoutes.js";
import { enquiryRoutes } from "./routes/enquiryRoutes.js";
import { couponRoutes } from "./routes/couponRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { instagramPostRoutes } from "./routes/instagramPostRoutes.js";
import { siteSettingRoutes } from "./routes/siteSettingRoutes.js";
import { adminUserRoutes } from "./routes/adminUserRoutes.js";
import { reviewRoutes } from "./routes/reviewRoutes.js";
import { toNodeHandler } from "better-auth/node";
import { getMigrations } from "better-auth/db/migration";
import { customerAuth, customerPool } from "./config/customer-auth.js";
import { customerRoutes } from "./routes/customerRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: (origin, callback) => {
      const configured = process.env.FRONTEND_URL || "http://localhost:8082";
      const allowed = !origin || origin === configured || (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
      callback(null, allowed);
    },
    credentials: true,
  }),
);
app.all("/api/customer-auth/*splat", toNodeHandler(customerAuth));
app.post("/api/payments/razorpay/webhook", express.raw({ type: "application/json", limit: "1mb" }), razorpayWebhook);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "LGS backend is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/blog-categories", blogCategoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/instagram-posts", instagramPostRoutes);
app.use("/api/site-settings", siteSettingRoutes);
app.use("/api/admin-users", adminUserRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/customer", customerRoutes);

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  await initializeDatabase();
  const migration = await getMigrations(customerAuth.options);
  // DATETIME is supported by Better Auth and avoids legacy MariaDB's implicit
  // zero defaults on additional TIMESTAMP columns. Only auth-generated DDL runs.
  const authSql = await migration.compileMigrations();
  for (const statement of authSql.split(/;\s*(?:\n|$)/).map((value) => value.trim()).filter(Boolean)) {
    await customerPool.query(statement.replace(/\btimestamp\(3\)/gi, "datetime(3)"));
  }
  startOrderEmailWorker();
  app.listen(port, () => {
    console.log(`LGS backend listening on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
