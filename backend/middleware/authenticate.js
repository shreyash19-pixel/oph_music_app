const jwt = require("jsonwebtoken");
require("dotenv");
const adminSignInModel = require("../admin/model/adminSignIn");

/**
 * Admin panel JWTs include top-level `role` and no `userData`.
 * Artist JWTs include `userData`; they skip DB session checks here.
 */
function isAdminPanelToken(decoded) {
  return (
    decoded &&
    typeof decoded.role === "string" &&
    decoded.role.length > 0 &&
    !decoded.userData
  );
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SECRET_KEY);
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }

  req.user = decoded;

  if (isAdminPanelToken(decoded)) {
    const email = decoded.email;
    if (!email) {
      return res.status(401).json({
        success: false,
        code: "SESSION_STALE",
        message: "Session no longer valid. Please sign in again.",
      });
    }

    try {
      const rows = await adminSignInModel.getAuthSessionByEmail(email);
      if (!rows || rows.length === 0) {
        return res.status(401).json({
          success: false,
          code: "SESSION_STALE",
          message: "Session no longer valid. Please sign in again.",
        });
      }

      const row = rows[0];
      const dbAv = Number(row.auth_version ?? 1);
      const tokenAv =
        decoded.av !== undefined && decoded.av !== null
          ? Number(decoded.av)
          : NaN;

      if (Number.isNaN(tokenAv) || tokenAv !== dbAv) {
        return res.status(401).json({
          success: false,
          code: "SESSION_STALE",
          message: "Your access was updated. Please sign in again.",
        });
      }

      const dbRole = row.Role;
      if (decoded.role !== dbRole) {
        return res.status(401).json({
          success: false,
          code: "SESSION_STALE",
          message: "Your role was updated. Please sign in again.",
        });
      }
    } catch (dbErr) {
      console.error("[authMiddleware] admin session check failed:", dbErr);
      return res.status(500).json({
        success: false,
        message: "Could not verify session",
      });
    }
  }

  next();
};

module.exports = authMiddleware;
