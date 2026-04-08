/**
 * After authMiddleware. Assign-role / admin list style routes.
 */
module.exports = function requireSuperAdmin(req, res, next) {
  if (req.user?.role === "super admin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};
