/**
 * After authMiddleware. Approve/reject for date booking & release date change (payment-verification).
 * Only super admin and administrative head — not administrative member.
 */
const ALLOWED = new Set(["super admin", "administrative head"]);

module.exports = function requireBookingVerificationManager(req, res, next) {
  const role = req.user?.role;
  if (!role) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (!ALLOWED.has(role)) {
    return res.status(403).json({
      success: false,
      message:
        "Only super admin or administrative head can approve or reject booking verification.",
    });
  }
  return next();
};
