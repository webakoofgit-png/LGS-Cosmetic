import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const OrderEmail = sequelize.define("OrderEmail", {
  eventId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: "event_id" },
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: "order_id" },
  recipient: { type: DataTypes.STRING(180), allowNull: false },
  payload: { type: DataTypes.JSON, allowNull: false, get() { const value = this.getDataValue("payload"); return typeof value === "string" ? JSON.parse(value) : value; } },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Queued" },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  lastError: { type: DataTypes.TEXT, allowNull: true, field: "last_error" },
  firstAttemptAt: { type: DataTypes.DATE, allowNull: true, field: "first_attempt_at" },
  sentAt: { type: DataTypes.DATE, allowNull: true, field: "sent_at" },
  nextAttemptAt: { type: DataTypes.DATE, allowNull: true, field: "next_attempt_at" },
  providerId: { type: DataTypes.STRING(180), allowNull: true, field: "provider_id" },
}, { tableName: "order_emails" });
