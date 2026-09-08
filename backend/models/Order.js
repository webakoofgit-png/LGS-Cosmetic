import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Order = sequelize.define(
  "Order",
  {
    orderNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true, field: "order_number" },
    customerName: { type: DataTypes.STRING(120), allowNull: false, field: "customer_name" },
    email: { type: DataTypes.STRING(180), allowNull: true },
    phone: { type: DataTypes.STRING(50), allowNull: true },
    shippingAddress: { type: DataTypes.TEXT, allowNull: true, field: "shipping_address" },
    billingAddress: { type: DataTypes.TEXT, allowNull: true, field: "billing_address" },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    shippingCharge: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: "shipping_charge" },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: "total_amount" },
    paymentMethod: { type: DataTypes.STRING(50), allowNull: true, field: "payment_method" },
    paymentStatus: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Pending", field: "payment_status" },
    orderStatus: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Pending", field: "order_status" },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "orders" },
);
