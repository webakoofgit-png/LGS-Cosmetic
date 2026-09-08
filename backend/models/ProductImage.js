import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ProductImage = sequelize.define(
  "ProductImage",
  {
    productId: { type: DataTypes.INTEGER, allowNull: false, field: "product_id" },
    url: { type: DataTypes.STRING(255), allowNull: false },
    alt: { type: DataTypes.STRING(180), allowNull: true },
    isPrimary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "is_primary" },
  },
  { tableName: "product_images" },
);
