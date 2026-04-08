/**
 * After authMiddleware. Who may create/update Website Config costing (QR) rows.
 * Administrative members are excluded (view Website Config elsewhere, not Setting).
 */
const ALLOWED = new Set([
  "super admin",
  "administrative head",
  "sales head",
  "sales member",
]);

module.exports = function requireCostingSettingsAccess(req, res, next) {
  const role = req.user?.role;
  if (!role) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (!ALLOWED.has(role)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to create or update costing settings.",
    });
  }
  return next();
};
