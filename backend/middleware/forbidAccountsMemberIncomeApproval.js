/**
 * Use after authMiddleware on POST /set-special-artists-income-status.
 * Accounts head may approve/reject; accounts member is view-only (matches admin UI).
 */
function forbidAccountsMemberIncomeApproval(req, res, next) {
  const role = String(req.user?.role ?? "")
    .trim()
    .toLowerCase();
  if (role === "accounts member") {
    return res.status(403).json({
      success: false,
      message: "Your role cannot approve or reject income status",
    });
  }
  next();
}

module.exports = forbidAccountsMemberIncomeApproval;
