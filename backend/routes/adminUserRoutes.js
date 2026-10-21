import { Router } from "express";
import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin.js";
import { sequelize } from "../config/database.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { signToken } from "../controllers/authController.js";

export const adminUserRoutes = Router();
adminUserRoutes.use(requireAuth, requireAdmin);
const publicFields = ["id", "name", "email", "role", "status", "lastLoginAt", "createdAt"];
const publicAdmin = (admin) => Object.fromEntries(publicFields.map((key) => [key, admin[key]]));
const fail = (message, status = 400) => Object.assign(new Error(message), { status });
function handleError(error, next) {
  next(error.name === "SequelizeUniqueConstraintError" ? fail("This email is already used by another administrator.", 409) : error);
}
function validate(body, creating) {
  if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 120) throw fail("Enter a name of up to 120 characters.");
  if (typeof body.email !== "string" || body.email.length > 180 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) throw fail("Enter a valid email address.");
  if (!["Admin", "Super Admin"].includes(body.role)) throw fail("Choose a valid role.");
  if (!["Active", "Inactive"].includes(body.status)) throw fail("Choose a valid status.");
  if (creating || body.password) {
    if (typeof body.password !== "string" || body.password.length < 8 || Buffer.byteLength(body.password, "utf8") > 72) throw fail("Use a password with at least 8 characters and at most 72 bytes.");
  }
  return { name: body.name.trim(), email: body.email.trim().toLowerCase(), role: body.role, status: body.status };
}

adminUserRoutes.get("/", async (req, res, next) => {
  try {
    const data = await Admin.findAll({ attributes: publicFields, ...(req.user.role === "Super Admin" ? {} : { where: { id: req.user.id } }), order: [["id", "ASC"]] });
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

adminUserRoutes.post("/", async (req, res, next) => {
  try {
    if (req.user.role !== "Super Admin") throw fail("Only a Super Admin can add administrators.", 403);
    const values = validate(req.body, true);
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const admin = await Admin.create({ ...values, passwordHash });
    res.status(201).json({ success: true, data: publicAdmin(admin) });
  } catch (error) { handleError(error, next); }
});

adminUserRoutes.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const self = id === req.user.id;
    if (!self && req.user.role !== "Super Admin") throw fail("Only a Super Admin can edit other administrators.", 403);
    const values = validate(req.body, false);
    if (self && (values.role !== req.user.role || values.status !== "Active")) throw fail("You cannot change your own role or deactivate your own account.");
    const passwordHash = req.body.password ? await bcrypt.hash(req.body.password, 12) : null;
    const result = await sequelize.transaction(async (transaction) => {
      const admins = await Admin.findAll({ transaction, lock: transaction.LOCK.UPDATE, order: [["id", "ASC"]] });
      const admin = admins.find((item) => item.id === id);
      if (!admin) throw fail("Administrator not found.", 404);
      if (admin.role === "Super Admin" && admin.status === "Active" && (values.role !== "Super Admin" || values.status !== "Active") && admins.filter((item) => item.role === "Super Admin" && item.status === "Active").length <= 1) throw fail("Keep at least one active Super Admin.");
      await admin.update({ ...values, ...(passwordHash ? { passwordHash, tokenVersion: admin.tokenVersion + 1 } : {}) }, { transaction });
      return { admin: publicAdmin(admin), ...(self ? { token: signToken(admin) } : {}) };
    });
    res.json({ success: true, data: result.admin, ...(result.token ? { token: result.token } : {}) });
  } catch (error) { handleError(error, next); }
});

adminUserRoutes.delete("/:id", async (req, res, next) => {
  try {
    if (req.user.role !== "Super Admin") throw fail("Only a Super Admin can delete administrators.", 403);
    const id = Number(req.params.id);
    if (id === req.user.id) throw fail("You cannot delete your own account.");
    await sequelize.transaction(async (transaction) => {
      const admins = await Admin.findAll({ transaction, lock: transaction.LOCK.UPDATE, order: [["id", "ASC"]] });
      const admin = admins.find((item) => item.id === id);
      if (!admin) throw fail("Administrator not found.", 404);
      if (admin.role === "Super Admin" && admin.status === "Active" && admins.filter((item) => item.role === "Super Admin" && item.status === "Active").length <= 1) throw fail("Keep at least one active Super Admin.");
      await admin.destroy({ transaction });
    });
    res.json({ success: true, message: "Administrator deleted." });
  } catch (error) { next(error); }
});
