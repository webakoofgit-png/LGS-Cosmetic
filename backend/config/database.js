import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

export const sequelize = new Sequelize(
  process.env.DB_NAME ?? "lgs_db",
  process.env.DB_USER ?? "root",
  process.env.DB_PASSWORD ?? "",
  {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    dialect: "mysql",
    logging: false,
  },
);

export async function initializeDatabase() {
  // Models are loaded lazily to avoid circular imports.
  const { syncModels } = await import("../models/index.js");
  syncModels();

  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("Database connection established.");
  } catch (error) {
    console.warn("Database connection failed. Backend will still start, but API calls will error until MySQL is available.");
    console.warn(error?.message ?? error);
  }
}
