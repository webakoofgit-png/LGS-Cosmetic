import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Coupon = sequelize.define(
  "Coupon",
  {
    code: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    discountType: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "percentage", field: "discount_type" },
    discountValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "discount_value" },
    minOrderAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: "min_order_amount" },
    maxDiscount: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: "max_discount" },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Active" },
    expiresAt: { type: DataTypes.DATE, allowNull: true, field: "expires_at" },
    usageLimit: { type: DataTypes.INTEGER, allowNull: true, field: "usage_limit" },
    usedCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: "used_count" },
  },
  { tableName: "coupons" },
);
