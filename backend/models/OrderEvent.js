import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const OrderEvent = sequelize.define("OrderEvent", {
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: "order_id" },
  orderStatus: { type: DataTypes.STRING(30), allowNull: false, field: "order_status" },
  paymentStatus: { type: DataTypes.STRING(40), allowNull: false, field: "payment_status" },
  note: { type: DataTypes.STRING(1000), allowNull: false },
}, { tableName: "order_events", updatedAt: false });
