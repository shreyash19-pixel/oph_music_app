/**
 * Use after authMiddleware. Blocks sales members from approve/reject (and equivalent) mutations.
 */
function forbidSalesMemberApprovals(req, res, next) {
  if (req.user?.role === "sales member") {
    return res.status(403).json({
      success: false,
      message: "Sales members cannot approve or reject",
    });
  }
  next();
}

module.exports = forbidSalesMemberApprovals;
