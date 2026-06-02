/**
 * Use after authMiddleware. Accounts head/member may view Content New & Manage but cannot edit or approve.
 */
const ROLES_CONTENT_VIEW_ONLY = ["accounts head", "accounts member"];

function forbidAccountsContentEdits(req, res, next) {
  if (ROLES_CONTENT_VIEW_ONLY.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message:
        "Accounts roles have view-only access to content and cannot make changes.",
    });
  }
  next();
}

module.exports = forbidAccountsContentEdits;
