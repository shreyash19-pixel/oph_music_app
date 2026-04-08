/**
 * After authMiddleware. Approve/reject TV publishing status — super admin, administrative head,
 * and administrative member (not lock/unlock or file uploads; those use requireTvPublishingManager).
 */
const STATUS_ROLES = new Set([
  "super admin",
  "administrative head",
  "administrative member",
]);

module.exports = function requireTvPublishingStatusEditor(req, res, next) {
  const role = req.user?.role;
  if (role && STATUS_ROLES.has(role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message:
      "Only super admin, administrative head, or administrative member can change TV publishing status.",
  });
};
