import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize } from "../config/database.js";
import { syncModels } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

async function main() {
  syncModels();
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log("Database migration completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
