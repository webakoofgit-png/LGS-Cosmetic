import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Blog = sequelize.define(
  "Blog",
  {
    title: { type: DataTypes.STRING(220), allowNull: false },
    slug: { type: DataTypes.STRING(240), allowNull: false, unique: true },
    excerpt: { type: DataTypes.TEXT, allowNull: true },
    content: { type: DataTypes.TEXT("long"), allowNull: true },
    featuredImage: { type: DataTypes.STRING(255), allowNull: true, field: "featured_image" },
    author: { type: DataTypes.STRING(120), allowNull: true },
    tags: { type: DataTypes.JSON, allowNull: true },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Draft" },
    publishedAt: { type: DataTypes.DATE, allowNull: true, field: "published_at" },
    metaTitle: { type: DataTypes.STRING(180), allowNull: true, field: "meta_title" },
    metaDescription: { type: DataTypes.TEXT, allowNull: true, field: "meta_description" },
    categoryId: { type: DataTypes.INTEGER, allowNull: true, field: "category_id" },
  },
  { tableName: "blogs" },
);
