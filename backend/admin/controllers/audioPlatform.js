const audioPlatform = require("../model/audioPlatform");

const getAllAudioPlatforms = async (req, res) => {
  try {
    const platforms = await audioPlatform.getAllAudioPlatforms();
    res.status(200).json({ success: true, data: platforms });
  } catch (error) {
    console.error("Error fetching audio platforms:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const addAudioPlatform = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Invalid name" });
    }

    const newPlatform = await audioPlatform.addAudioPlatform(name.trim());
    return res.status(200).json({ success: true, data: newPlatform });
  } catch (err) {
    console.error("addAudioPlatform error", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A platform with this name already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

// DELETE /audio-platforms/:id
const deleteAudioPlatform = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const affectedRows = await audioPlatform.deleteAudioPlatformById(id);
    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Audio platform not found" });
    }

    return res.json({ success: true, message: "Audio platform deleted" });
  } catch (err) {
    console.error("deleteAudioPlatform error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getallSongMetrics = async (req, res) => {
  try {
    const songs = await audioPlatform.getSongAudioMetrics();
    res.status(200).json({ success: true, data: songs });
  } catch (error) {
    console.error("Error fetching participant:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getSongMetrics = async (req, res) => {
  try {
    const songs = await audioPlatform.getAllSongAudioMetrics();
    res.status(200).json({ success: true, data: songs });
  } catch (error) {
    console.error("Error fetching participant:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getSongMetricsByID = async (req, res) => {
  try {
    const songId = req.params.id;
    if (!songId) {
      return res
        .status(400)
        .json({ success: false, message: "Song ID is required" });
    }
    const songs = await audioPlatform.getAllBySongId(songId);
    res.status(200).json({ success: true, data: songs });
  } catch (error) {
    console.error("Error fetching participant:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const validateCreatePayload = (body) => {
  const errors = [];
  if (!body.song_id) errors.push("song_id is required");
  // OPH_ID and song_name may be optional depending on your schema, but check if needed
  // if (!body.OPH_ID) errors.push("OPH_ID is required");
  return errors;
};

const createMetric = async (req, res) => {
  try {
    const body = req.body ?? {};
    const errors = validateCreatePayload(body);
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    // coerce types where helpful
    const payload = {
      song_id: Number(body.song_id),
      OPH_ID: body.OPH_ID ?? null,
      song_name: body.song_name ?? null,
      audio_platform_name: body.audio_platform_name ?? null,
      audio_platform_streams:
        typeof body.audio_platform_streams !== "undefined"
          ? Number(body.audio_platform_streams)
          : 0,
      audio_platform_revenue:
        typeof body.audio_platform_revenue !== "undefined"
          ? String(body.audio_platform_revenue)
          : "0.00",
    };

    const created = await audioPlatform.createSongAudioMetric(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("createMetric error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

const updateMetric = async (req, res) => {
  try {
    const body = req.body ?? {};

    // require targeting info
    if (
      !body.id &&
      !(body.song_id && typeof body.audio_platform_name !== "undefined")
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Provide id OR provide song_id and audio_platform_name to identify the record",
      });
    }

    // build payload
    const payload = {
      id: body.id ? Number(body.id) : undefined,
      song_id: body.song_id ? Number(body.song_id) : undefined,
      OPH_ID: typeof body.OPH_ID !== "undefined" ? body.OPH_ID : undefined,
      song_name:
        typeof body.song_name !== "undefined" ? body.song_name : undefined,
      audio_platform_name:
        typeof body.audio_platform_name !== "undefined"
          ? body.audio_platform_name
          : undefined,
      audio_platform_streams:
        typeof body.audio_platform_streams !== "undefined"
          ? Number(body.audio_platform_streams)
          : undefined,
      audio_platform_revenue:
        typeof body.audio_platform_revenue !== "undefined"
          ? String(body.audio_platform_revenue)
          : undefined,
    };

    const updated = await audioPlatform.updateSongAudioMetric(payload);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, error: "No record found to update" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("updateMetric error:", err);
    // If our model threw due to missing identifiers, reflect that
    if (err && err.message && err.message.includes("Missing id")) {
      return res.status(400).json({ success: false, error: err.message });
    }
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getSongMetrics,
  getSongMetricsByID,
  createMetric,
  updateMetric,
  getAllAudioPlatforms,
  addAudioPlatform,
  deleteAudioPlatform,
  getallSongMetrics,
};
