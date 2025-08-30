const songsModel = require("../model/songs");
const { saveNotification } = require("../../utils/notify");

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
      message: "Failed to fetch songs",
    });
  }
};

const getSongsUnderReview = async (req, res) => {
  try {
    const { ophId, songId } = req.params;
    console.log("Params:", req.params);

    if (!ophId || !songId) {
      return res
        .status(400)
        .json({ message: "OPH_ID and songId are required" });
    }

    const data = await songsModel.getSongsByOphIdUnderReview(ophId, songId);

    if (data.length === 0) {
      return res.status(404).json({
        message: "No song found under review with provided OPH_ID and songId",
      });
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
      return res
        .status(400)
        .json({ message: "OPH_ID and songId are required" });
    }

    const data = await songsModel.getSongsByOphIdApproved(ophId, songId);

    if (data.length === 0) {
      return res.status(404).json({
        message: "No song found under review with provided OPH_ID and songId",
      });
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

    // Validate section (your client appears to send "Audio"/"Video")
    if (!["Audio", "Video"].includes(section)) {
      return res
        .status(400)
        .json({ error: "Invalid section. Must be 'Audio' or 'Video'." });
    }

    const table = section === "Audio" ? "audio_details" : "video_details";
    console.log(table);

    // Pass ophid only for audio
    const result = await songsModel.updateSongSectionStatus(
      table,
      status,
      reason,
      songId,
      section === "Audio" ? ophid : null,
    );

    if (section === "Audio" && status === "rejected") {
      console.log("Audio Reject Api ");
    } else if (section === "Video" && status === "rejected") {
      console.log("Video Reject Api ");
    }

    console.log(result);
    console.log("test");
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No matching record found." });
    }

    // Update the main song status using the model function directly
    try {
      console.log("Updating main song status");
      console.log(ophid, songId, reason);
      
      // Validate parameters before calling the model function
      if (!ophid || !songId) {
        console.error("Missing required parameters: ophid or songId");
        throw new Error("Missing required parameters");
      }
      
      await songsModel.updateSongStatus(parseInt(songId), ophid, (reason || "").trim() || null);
    } catch (error) {
      console.error("Error updating main song status:", error);
      // Continue with notification even if main status update fails
    }

    const data = await songsModel.getSongsByOphIdUnderReview(ophid, songId);
    const songName = data?.[0]?.audio_song_name || "your song";

    // Normalize/derive status text
    const statusLower = String(status || "").toLowerCase();
    const isAccepted = statusLower === "accepted" || statusLower === "approved";
    const isRejected = statusLower === "rejected";

    const title = isAccepted
      ? `${section} has been approved for ${songName}`
      : isRejected
        ? `${section} has been rejected for ${songName}`
        : ``;

    // Build message and (optional) link based on status
    let message;
    let link; // only set for rejected

    if (isAccepted) {
      message = `${section} for your song ${songName} was ${statusLower}.`;
      // No link when accepted/approved
    } else if (isRejected) {
      const reasonText = reason ? ` Reason: ${reason}` : "";
      message = `${section} of your song ${songName} was rejected due to ${reasonText}`;
      link = "/dashboard/upload-song"; // include link when rejected
    } else {
      message = `${section} for your song ${songName} was ${statusLower}.`;
      // No link by default for other statuses
    }

    // Prepare notification payload; include link only when present
    const notificationPayload = {
      ophid,
      message,
      title,
      ...(link ? { link } : {}),
    };

    // Save to DB
    const notification = await saveNotification(notificationPayload);

    // Emit via Socket.IO if user is online
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    if (!io || !onlineUsers) {
      console.warn("Socket IO or onlineUsers map is not initialized");
    } else {
      const userSocketId = onlineUsers.get(ophid);

      if (userSocketId) {
        io.to(userSocketId).emit("Music-update", notification);
        console.log(
          `Emitted 'Music-update' to ophid ${ophid}, socket ID: ${userSocketId}`,
        );
      } else {
        console.log(`No active socket found for ophid: ${ophid}`);
      }
    }

    res.json({ message: `Status updated for ${section}.` });
  } catch (err) {
    console.error("Error updating song status:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};


const updateSongStatus = async (req, res) => {
  try {
    const { ophid, songId, status, reason } = req.body;
    const result = await songsModel.updateSongStatus(parseInt(songId), ophid, (reason || "").trim());
    res.status(200).json({ message: "Song status updated successfully.", result });
  } catch (err) {
    console.error("Error updating song status:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = {
  getAll,
  getSongsUnderReview,
  getAllApprovedSongs,
  getSongApproved,
  updateSongSectionStatus,
  updateSongStatus
};
