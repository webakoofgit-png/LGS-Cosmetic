import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const SiteSetting = sequelize.define("SiteSetting", {
  key: { type: DataTypes.STRING(100), primaryKey: true },
  value: {
    type: DataTypes.JSON,
    allowNull: false,
    get() {
      const raw = this.getDataValue("value");
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    },
  },
}, { tableName: "site_settings" });
