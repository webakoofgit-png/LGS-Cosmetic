import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME ?? "lgs_db"}\``);
  await connection.end();
  console.log("Database created or already exists.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
