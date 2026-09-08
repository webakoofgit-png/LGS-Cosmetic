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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: (origin, callback) => {
      const configured = process.env.FRONTEND_URL || "http://localhost:8082";
      const allowed = !origin || origin === configured || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      callback(null, allowed);
    },
    credentials: true,
  }),
);
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

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  await initializeDatabase();
  app.listen(port, () => {
    console.log(`LGS backend listening on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
