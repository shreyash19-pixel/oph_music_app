/**
 * After authMiddleware. Only super admin and administrative head/member may
 * approve or reject artist onboarding steps (POST /update-status).
 */
const APPROVER_ROLES = new Set([
  "super admin",
  "administrative head",
  "administrative member",
]);

function requireArtistOnboardingApprover(req, res, next) {
  const role = req.user?.role;
  if (role && APPROVER_ROLES.has(role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message:
      "Only super admin or administrative head/member can approve or reject onboarding steps",
  });
}

module.exports = requireArtistOnboardingApprover;
