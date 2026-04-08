/**
 * Use after authMiddleware. Blocks roles that may view but must not approve/reject special-artist songs.
 */
const ROLES_CANNOT_VERIFY_SPECIAL_ARTIST_SONGS = [
  "sales member",
  "administrative member",
];

function forbidSalesMemberApprovals(req, res, next) {
  if (ROLES_CANNOT_VERIFY_SPECIAL_ARTIST_SONGS.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "Your role cannot approve or reject this submission",
    });
  }
  next();
}

module.exports = forbidSalesMemberApprovals;
