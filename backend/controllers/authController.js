import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/index.js";

function signToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
    process.env.JWT_SECRET || "change_this_to_a_strong_secret",
    { expiresIn: "7d" },
  );
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    await admin.update({ lastLoginAt: new Date() });

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token: signToken(admin),
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: admin.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const admin = await Admin.findByPk(req.user.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    return res.json({
      success: true,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
}
