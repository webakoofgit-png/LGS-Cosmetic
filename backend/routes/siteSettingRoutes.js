import { Router } from "express";
import { SiteSetting } from "../models/SiteSetting.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

export const siteSettingRoutes = Router();
const validKey = (key) => key === "seo" || key === "general" || /^page-[a-z0-9-]{1,80}$/.test(key);
const generalFields = { name: 150, tagline: 250, phone: 40, whatsapp: 20, addressLine1: 250, addressLine2: 250, instagram: 500, instagramHandle: 100, facebook: 500, mapsLink: 500 };

siteSettingRoutes.get("/:key", async (req, res, next) => {
  try {
    if (!validKey(req.params.key)) return res.status(400).json({ success: false, message: "Invalid setting." });
    const setting = await SiteSetting.findByPk(req.params.key);
    res.json({ success: true, data: setting?.value ?? null });
  } catch (error) { next(error); }
});

siteSettingRoutes.put("/:key", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const key = req.params.key;
    if (!validKey(key)) return res.status(400).json({ success: false, message: "Invalid setting." });
    const fields = key === "general" ? generalFields : key === "seo" ? { title: 180, description: 500, keywords: 500, socialTitle: 180, socialDescription: 500 } : { title: 180, intro: 1000, body: 30000 };
    const value = {};
    for (const [field, limit] of Object.entries(fields)) {
      if (typeof req.body[field] !== "string" || req.body[field].length > limit) {
        return res.status(400).json({ success: false, message: `${field} must be text with at most ${limit} characters.` });
      }
      value[field] = req.body[field].trim();
    }
    if (key === "general") {
      for (const field of ["name", "phone", "whatsapp", "addressLine1"]) {
        if (!value[field]) return res.status(400).json({ success: false, message: `${field} is required.` });
      }
      if (!/^\+?[\d\s()-]{7,40}$/.test(value.phone) || value.phone.replace(/\D/g, "").length < 7) return res.status(400).json({ success: false, message: "Enter a valid contact phone number." });
      if (!/^\d{7,15}$/.test(value.whatsapp)) return res.status(400).json({ success: false, message: "Enter the WhatsApp number with country code, using digits only." });
      for (const field of ["instagram", "facebook", "mapsLink"]) {
        if (!value[field]) continue;
        try { if (!["http:", "https:"].includes(new URL(value[field]).protocol)) throw new Error(); }
        catch { return res.status(400).json({ success: false, message: `Enter a valid https:// link for ${field}.` }); }
      }
    } else if (!value.title) return res.status(400).json({ success: false, message: "Title is required." });
    await SiteSetting.upsert({ key, value });
    res.json({ success: true, data: value, message: "Changes saved." });
  } catch (error) { next(error); }
});
