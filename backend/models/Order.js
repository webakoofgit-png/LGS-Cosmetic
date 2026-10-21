import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Order = sequelize.define(
  "Order",
  {
    orderNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true, field: "order_number" },
    customerId: { type: DataTypes.STRING(64), allowNull: true, field: "customer_id", index: true },
    checkoutKey: { type: DataTypes.STRING(100), allowNull: true, unique: true, field: "checkout_key" },
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
    deliveryMode: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Delivery", field: "delivery_mode" },
    couponCode: { type: DataTypes.STRING(60), allowNull: true, field: "coupon_code" },
    gatewayOrderId: { type: DataTypes.STRING(100), allowNull: true, unique: true, field: "gateway_order_id" },
    paymentReference: { type: DataTypes.STRING(100), allowNull: true, field: "payment_reference" },
    courierName: { type: DataTypes.STRING(100), allowNull: true, field: "courier_name" },
    trackingNumber: { type: DataTypes.STRING(150), allowNull: true, field: "tracking_number" },
    trackingUrl: { type: DataTypes.STRING(1000), allowNull: true, field: "tracking_url" },
    stockReleased: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "stock_released" },
  },
  { tableName: "orders" },
);
