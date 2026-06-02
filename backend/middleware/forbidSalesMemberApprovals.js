/**
 * Use after authMiddleware. Blocks roles that may view but must not approve/reject
 * (payments, special-artist submissions, withdrawals, etc.).
 */
const ROLES_CANNOT_APPROVE_OR_REJECT = [
  "sales member",
  "administrative member",
  "project member",
];

function forbidSalesMemberApprovals(req, res, next) {
  if (ROLES_CANNOT_APPROVE_OR_REJECT.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "Your role cannot approve or reject this submission",
    });
  }
  next();
}

module.exports = forbidSalesMemberApprovals;
