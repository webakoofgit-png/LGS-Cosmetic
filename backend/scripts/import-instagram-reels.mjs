// Run once when deploying the admin-managed gallery. Do not run on server startup:
// deleted reels must stay deleted.
import { InstagramPost } from "../models/InstagramPost.js";
import { sequelize } from "../config/database.js";

const reels = [
  ["DLAShWCvp_1", "lgs-aloe-vera-instagram", "LGS Aloe Vera Shampoo"],
  ["DMnynZWhydV", "DMnynZWhydV", "LGS Diamond Facial Kit"],
  ["DL75s7JhkzG", "DL75s7JhkzG", "LGS Beauty — Colour by LGS"],
  ["DLp0tpkPpLw", "DLp0tpkPpLw", "LGS Lemon Face Wash"],
  ["DLd0ohmB5H9", "DLd0ohmB5H9", "LGS Anti-Blemish Bar and Moisturizer"],
  ["DKUq-jHvBB7", "DKUq-jHvBB7", "LGS Sunblock SPF 50"],
];
try {
  await sequelize.authenticate();
  await sequelize.transaction(async (transaction) => {
    for (const [code, image, caption] of reels) {
      const link = `https://www.instagram.com/reel/${code}/`;
      if (await InstagramPost.findOne({ where: { link }, transaction })) continue;
      if (await InstagramPost.count({ transaction }) >= 12) throw new Error("Gallery limit reached");
      const sortOrder = Number(await InstagramPost.max("sortOrder", { transaction }) ?? -1) + 1;
      await InstagramPost.create({ link, image: `/reels/${image}.jpg`, caption, sortOrder, isActive: true }, { transaction });
    }
  });
  console.log("Existing reels imported into the admin gallery.");
} finally {
  await sequelize.close();
}
