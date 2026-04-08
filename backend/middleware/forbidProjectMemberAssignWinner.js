/**
 * Use after authMiddleware. Project members may view event winning data but not assign winners.
 */
function forbidProjectMemberAssignWinner(req, res, next) {
  const role = String(req.user?.role ?? "")
    .trim()
    .toLowerCase();
  if (role === "project member") {
    return res.status(403).json({
      success: false,
      message: "Project members cannot assign event winners",
    });
  }
  next();
}

module.exports = forbidProjectMemberAssignWinner;
