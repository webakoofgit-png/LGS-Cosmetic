import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ContactEnquiry = sequelize.define(
  "ContactEnquiry",
  {
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(180), allowNull: true },
    phone: { type: DataTypes.STRING(50), allowNull: true },
    subject: { type: DataTypes.STRING(180), allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "New" },
  },
  { tableName: "contact_enquiries" },
);
