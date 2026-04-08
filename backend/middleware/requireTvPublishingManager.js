/**
 * After authMiddleware. Only super admin and administrative head may unlock the page,
 * toggle A/V edit locks, or upload TV publishing files. Approve/reject uses
 * requireTvPublishingStatusEditor (includes administrative member).
 */
const MANAGE_ROLES = new Set(["super admin", "administrative head"]);

module.exports = function requireTvPublishingManager(req, res, next) {
  const role = req.user?.role;
  if (role && MANAGE_ROLES.has(role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message:
      "Only super admin or administrative head can unlock or edit TV publishing files.",
  });
}
