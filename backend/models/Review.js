import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Review = sequelize.define("Review", {
  reviewerName: { type: DataTypes.STRING(150), allowNull: false, field: "reviewer_name" },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  text: { type: DataTypes.TEXT, allowNull: false },
  reviewUrl: { type: DataTypes.STRING(1000), allowNull: true, field: "review_url" },
  source: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "Google" },
  isExcerpt: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "is_excerpt" },
  isTranslated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "is_translated" },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Published" },
}, { tableName: "reviews" });
