import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const InstagramPost = sequelize.define(
  "InstagramPost",
  {
    image: { type: DataTypes.STRING(255), allowNull: false },
    caption: { type: DataTypes.STRING(255), allowNull: true },
    link: { type: DataTypes.STRING(500), allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: "sort_order" },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "is_active" },
  },
  { tableName: "instagram_posts" },
);
