import { fromNodeHeaders } from "better-auth/node";
import { customerAuth } from "../config/customer-auth.js";

export async function requireCustomer(req, res, next) {
  try {
    const session = await customerAuth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session?.user) return res.status(401).json({ success: false, message: "Please sign in to continue." });
    req.customer = session.user;
    next();
  } catch (error) { next(error); }
}
