const db = require("../DB/connect");
const {
  ALLOWED_PRESIGNED_VIDEO_PURPOSES,
  resolvePresignedVideoKeyPrefix,
  getPresignedPutUrlForPrefix,
} = require("../utils");

function tokenOphId(req) {
  return (
    req.user?.userData?.artist?.id ||
    req.user?.userData?.artist?.OPH_ID ||
    req.user?.ophid ||
    req.user?.OPH_ID
  );
}

/**
 * GET /presigned-upload/video?purpose=...&filename=...&content_type=...&song_id=...&page_name=...
 */
exports.presignedVideoUpload = async (req, res) => {
  try {
    const purpose = String(req.query.purpose || "").trim();
    const filename = String(req.query.filename || "").trim();
    const content_type =
      req.query.content_type ||
      req.query.contentType ||
      "application/octet-stream";

    const tokenOphid = tokenOphId(req);

    if (!purpose || !filename) {
      return res.status(400).json({
        success: false,
        message: "Missing purpose or filename",
      });
    }

    if (!ALLOWED_PRESIGNED_VIDEO_PURPOSES.includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: `Invalid purpose. Allowed: ${ALLOWED_PRESIGNED_VIDEO_PURPOSES.join(", ")}`,
      });
    }

    const song_id = req.query.song_id
      ? String(req.query.song_id).trim()
      : "";
    const page_name = req.query.page_name
      ? String(req.query.page_name).trim()
      : "";

    /** Admin JWT: role at top-level, no userData (see authenticate.js) */
    const isAdmin = Boolean(
      req.user &&
        typeof req.user.role === "string" &&
        req.user.role.length > 0 &&
        !req.user.userData
    );

    /** Purposes that require an artist OPH ID (from token or query for admin) */
    const needsOph =
      purpose === "professional" ||
      purpose === "admin-professional" ||
      purpose === "epk-bio" ||
      purpose === "epk-story" ||
      purpose === "song-video";

    let ophid = tokenOphid ? String(tokenOphid).trim() : "";
    if (isAdmin && req.query.ophid) {
      ophid = String(req.query.ophid).trim();
    }

    if (needsOph && !ophid) {
      return res.status(400).json({
        success: false,
        message: "Missing artist id (ophid)",
      });
    }

    const needsSong =
      purpose === "song-video" ||
      purpose === "tv-publishing" ||
      purpose === "admin-tv";

    if (needsSong && !song_id) {
      return res.status(400).json({
        success: false,
        message: "Missing song_id",
      });
    }

    if (purpose === "page-media" && !page_name) {
      return res.status(400).json({
        success: false,
        message: "Missing page_name",
      });
    }

    if (purpose === "song-video") {
      const [rows] = await db.execute(
        `SELECT song_id FROM songs_register WHERE song_id = ? AND (oph_id = ? OR OPH_ID = ?) LIMIT 1`,
        [song_id, ophid, ophid]
      );
      if (!rows || rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Song not found or access denied",
        });
      }
    }

    if (purpose === "tv-publishing") {
      const [rows] = await db.execute(
        `SELECT song_id FROM tvPublishing WHERE song_id = ? AND OPH_ID = ? LIMIT 1`,
        [song_id, ophid]
      );
      if (!rows || rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "TV content not found or access denied",
        });
      }
    }

    const keyPrefix = resolvePresignedVideoKeyPrefix(purpose, {
      ophid,
      song_id,
      page_name,
    });

    const { uploadUrl, publicUrl, contentType } = getPresignedPutUrlForPrefix(
      keyPrefix,
      filename,
      content_type
    );

    return res.status(200).json({
      success: true,
      uploadUrl,
      publicUrl,
      contentType,
    });
  } catch (err) {
    console.error("[presigned-upload] presignedVideoUpload:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create upload URL",
    });
  }
};
