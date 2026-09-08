import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const OrderItem = sequelize.define(
  "OrderItem",
  {
    orderId: { type: DataTypes.INTEGER, allowNull: false, field: "order_id" },
    productId: { type: DataTypes.INTEGER, allowNull: true, field: "product_id" },
    productName: { type: DataTypes.STRING(180), allowNull: false, field: "product_name" },
    productImage: { type: DataTypes.STRING(255), allowNull: true, field: "product_image" },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  },
  { tableName: "order_items" },
);
