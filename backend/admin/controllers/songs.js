const songsModel = require('../model/songs')

getAll = async (req, res) => {
  try {
    const songs = await songsModel.getAllSongs();
    res.status(200).json({
      success: true,
      data: songs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch songs',
    });
  }
};

const getSongsUnderReview = async (req, res) => {
  try {
    const { ophId, songId } = req.params;
    console.log("Params:", req.params);

    if (!ophId || !songId) {
      return res.status(400).json({ message: "OPH_ID and songId are required" });
    }

    const data = await songsModel.getSongsByOphIdUnderReview(ophId, songId);

    if (data.length === 0) {
      return res.status(404).json({ message: "No song found under review with provided OPH_ID and songId" });
    }

    res.status(200).json({ song: data[0] });
  } catch (error) {
    console.error("Error fetching song:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllApprovedSongs = async (req, res) => {
  try {
    const data = await songsModel.getAllApprovedSongs();
    console.log("Fetched");
    

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No approved songs found" });
    }

    res.status(200).json({ songs: data });
  } catch (error) {
    console.error("Error fetching approved songs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getSongApproved = async (req, res) => {
  try {
    const { ophId, songId } = req.params;
    console.log("Params:", req.params);

    if (!ophId || !songId) {
      return res.status(400).json({ message: "OPH_ID and songId are required" });
    }

    const data = await songsModel.getSongsByOphIdApproved(ophId, songId);

    if (data.length === 0) {
      return res.status(404).json({ message: "No song found under review with provided OPH_ID and songId" });
    }

    res.status(200).json({ song: data[0] });
  } catch (error) {
    console.error("Error fetching song:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateSongSectionStatus = async (req, res) => {
  try {
    const { songId, ophid, section, status, reason } = req.body;

    console.log(req.body);
    console.log("from Content");

    if (!["Audio", "Video"].includes(section)) {
      return res.status(400).json({ error: "Invalid section. Must be 'audio' or 'video'." });
    }

    const table = section === "Audio" ? "audio_details" : "video_details";
    console.log(table);

    // Pass ophid only for audio
    const result = await songsModel.updateSongStatus(table, status, reason, songId, section === "Audio" ? ophid : null);

    console.log(result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No matching record found." });
    }

    res.json({ message: `Status updated for ${section}.` });
  } catch (err) {
    console.error("Error updating song status:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};


module.exports={getAll,getSongsUnderReview,getAllApprovedSongs,getSongApproved,updateSongSectionStatus}