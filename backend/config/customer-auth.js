import "./database.js";
import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";

export const customerPool = createPool({
  host: process.env.DB_HOST || "localhost", port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lgs_db", timezone: "Z", connectionLimit: 5,
});
const frontend = process.env.FRONTEND_URL || "http://localhost:8080";
export const customerAuth = betterAuth({
  appName: "LGS Cosmetics",
  baseURL: process.env.CUSTOMER_AUTH_URL || "http://localhost:5000",
  basePath: "/api/customer-auth",
  secret: process.env.CUSTOMER_AUTH_SECRET || process.env.JWT_SECRET,
  database: customerPool,
  trustedOrigins: [...new Set([frontend, ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:8080", "http://127.0.0.1:8080"])])],
  emailAndPassword: { enabled: true, minPasswordLength: 8, maxPasswordLength: 128 },
  user: { modelName: "customers" },
  session: { modelName: "customer_sessions", expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  account: { modelName: "customer_accounts" },
  verification: { modelName: "customer_verifications" },
  advanced: { cookiePrefix: "lgs-customer" },
  rateLimit: { enabled: true, window: 60, max: 60, customRules: { "/sign-in/email": { window: 60, max: 10 }, "/sign-up/email": { window: 60, max: 5 } } },
});
