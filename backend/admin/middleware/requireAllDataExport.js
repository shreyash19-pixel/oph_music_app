const {
  exportKeyFromRequestPath,
  canDownloadExport,
} = require("../utils/allDataRolePermissions");

/**
 * Blocks All Data Excel download when role lacks permission (e.g. department members = show only).
 */
function requireAllDataExport(req, res, next) {
  const role = req.user?.role;
  const exportKey = exportKeyFromRequestPath(req);

  if (!exportKey) {
    return res.status(404).json({ success: false, message: "Unknown export route" });
  }

  if (!canDownloadExport(role, exportKey)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to download this export",
    });
  }

  req.allDataExportKey = exportKey;
  next();
}

module.exports = requireAllDataExport;
