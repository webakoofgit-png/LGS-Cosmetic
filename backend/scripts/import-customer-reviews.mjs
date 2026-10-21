import { readFileSync } from "node:fs";
import { sequelize } from "../config/database.js";
import { Review } from "../models/Review.js";

const source = JSON.parse(readFileSync(new URL("../data/customer-reviews.json", import.meta.url), "utf8"));
try {
  await sequelize.authenticate();
  await Review.sync({ alter: true });
  await sequelize.transaction(async (transaction) => {
    for (const { recordingTimestamp: _timestamp, ...review } of source.reviews) {
      // Preserve edits made later by the owner if this import is run again.
      const [, created] = await Review.findOrCreate({
        where: { reviewerName: review.reviewerName, source: "Google" },
        defaults: { ...review, source: "Google", status: "Published", reviewUrl: source.sourceUrl },
        transaction,
      });
      console.log(`${created ? "Imported" : "Already exists"}: ${review.reviewerName}`);
    }
  });
} finally { await sequelize.close(); }
