/**
 * Artist "all details" updates are not allowed for sales members (view-only in admin UI).
 */
module.exports = function forbidSalesMemberArtistEdits(req, res, next) {
  const role = String(req.user?.role ?? "")
    .trim()
    .toLowerCase();
  if (role === "sales member") {
    return res.status(403).json({
      success: false,
      message:
        "Sales members have view-only access and cannot update artist details.",
    });
  }
  next();
};
