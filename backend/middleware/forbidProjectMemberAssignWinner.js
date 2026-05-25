/** Roles that may view event winning but must not assign or change winners. */
const FORBIDDEN_ASSIGN_WINNER_ROLES = new Set([
  "project member",
  "sales head",
  "sales member",
  "accounts head",
  "accounts member",
]);

/**
 * Use after authMiddleware. View-only roles may read winning data but not POST assign-winner.
 */
function forbidProjectMemberAssignWinner(req, res, next) {
  const role = String(req.user?.role ?? "")
    .trim()
    .toLowerCase();
  if (FORBIDDEN_ASSIGN_WINNER_ROLES.has(role)) {
    return res.status(403).json({
      success: false,
      message: "Your role cannot assign event winners",
    });
  }
  next();
}

module.exports = forbidProjectMemberAssignWinner;
