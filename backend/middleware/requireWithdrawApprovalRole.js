/**
 * Use after authMiddleware. Only super admin and accounts head may approve/reject withdrawals.
 */
const WITHDRAWAL_APPROVE_ROLES = ["super admin", "accounts head"];

function requireWithdrawApprovalRole(req, res, next) {
  if (!WITHDRAWAL_APPROVE_ROLES.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "Only the accounts head can approve or reject withdrawals.",
    });
  }
  next();
}

module.exports = requireWithdrawApprovalRole;
