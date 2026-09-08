import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ProductCategory = sequelize.define(
  "ProductCategory",
  {
    name: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    image: { type: DataTypes.STRING(255), allowNull: true },
    group: { type: DataTypes.STRING(50), allowNull: true },
    types: { type: DataTypes.JSON, allowNull: true },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Active" },
    displayOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: "product_categories" },
);
