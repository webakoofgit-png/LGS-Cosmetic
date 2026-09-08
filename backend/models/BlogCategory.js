import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const BlogCategory = sequelize.define(
  "BlogCategory",
  {
    name: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Active" },
  },
  { tableName: "blog_categories" },
);
