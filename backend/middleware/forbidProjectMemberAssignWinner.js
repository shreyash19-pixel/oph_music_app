/** Roles that may view event winning but must not assign winners. */
const FORBIDDEN_ASSIGN_WINNER_ROLES = new Set([
  "project member",
  "accounts head",
  "accounts member",
]);

/**
 * Use after authMiddleware. Project members and accounts roles may view event winning data but not assign winners.
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
