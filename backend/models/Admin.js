import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Admin = sequelize.define(
  "Admin",
  {
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "Super Admin" },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Active" },
    lastLoginAt: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "admins" },
);
