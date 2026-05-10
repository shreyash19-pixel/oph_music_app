const {
  isFullExportRole,
  fetchAllowedArtistOphIdsSet,
} = require("../utils/allDataExportPolicy");

/**
 * After authenticate: attaches req.exportFullAccess and req.exportAllowedOphIds for All Data Excel routes.
 */
async function attachExportScope(req, res, next) {
  try {
    const role = req.user?.role;
    if (!role) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (isFullExportRole(role)) {
      req.exportFullAccess = true;
      req.exportAllowedOphIds = null;
    } else {
      req.exportFullAccess = false;
      req.exportAllowedOphIds = await fetchAllowedArtistOphIdsSet();
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = attachExportScope;
