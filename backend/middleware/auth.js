import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET || "change_this_to_a_strong_secret");
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
  try {
    const admin = await Admin.findByPk(claims.id);
    if (!admin || admin.status !== "Active" || (claims.version ?? 0) !== admin.tokenVersion) {
      return res.status(401).json({ success: false, message: "Your session has ended. Please sign in again." });
    }
    req.user = { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
    return next();
  } catch (error) { return next(error); }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "Super Admin" && req.user?.role !== "Admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  return next();
}
