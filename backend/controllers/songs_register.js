const songRegModel = require("../model/songs_register");
const db = require("../DB/connect");
const SongApplicationStatusService = require("../services/song/SongApplicationStatusService");
const SongRegistrationService = require("../services/song/SongRegistrationService");


exports.insertNewSongRegDetails = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { oph_id, project_type, name, release_date, lyricalVid, next_step, videoType, } = req.body;

    if (!oph_id || !project_type || !name || !release_date || !next_step) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Normalize project_type values (case-insensitive)
    let normalizedProjectType = project_type;
    const lowerProjectType = project_type?.toLowerCase().trim();
    if (lowerProjectType === "new project") {
      normalizedProjectType = "New Project";
    } else if (lowerProjectType === "hybrid project") {
      normalizedProjectType = "Hybrid Project"; // Should not happen for regular songs, but normalize if it does
    } else if (lowerProjectType === "paid in advance") {
      normalizedProjectType = "Paid in Advance";
    }

    const RegSongRes = await songRegModel.insertNewSong(
      oph_id,
      normalizedProjectType,
      name,
      release_date,
      lyricalVid === false ? false : true, // Convert to boolean
      next_step,
      videoType,
      connection
    );

    if (RegSongRes) {
      // Use insertId from the insert result (auto-increment)
      const song_id = songRegModel.getSongIdFromInsert(RegSongRes);
      // Calendar entry is created only after payment is approved (calendar = source of truth for committed dates)
      // Release date stays in songs_register only until then, so draft songs don't block the date
      // Initialize song_application_status entry with all statuses as 'pending'
      await SongApplicationStatusService.initializeSongApplicationStatus(
        connection,
        oph_id,
        song_id,
        name
      );

      // Paid in advance: sync status_payment from Date Booking if this date was pre-booked
      if (normalizedProjectType === "Paid in Advance" && release_date) {
        await SongApplicationStatusService.syncStatusPaymentFromDateBooking(
          connection,
          oph_id,
          song_id,
          release_date
        );
      }
      
      await connection.commit();
      
      return res.status(201).json({
        success: true,
        message: "Song Registered Successfully",
        contentID: song_id,
        song_id: song_id
      });
    }
  } catch (err) {
    await connection.rollback();
    console.error("Error in insertNewSongRegDetails:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    connection.release();
  }
};

exports.insertHybridSongRegDetails = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { oph_id, project_type, name, release_date, lyricalVid, available_on_music_platforms, next_step, projectsType, videoType } = req.body;

    console.log(req.body);

    if (!oph_id || !project_type || !name || !release_date) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Normalize project_type values to capitalized versions only (case-insensitive)
    let normalizedProjectType = project_type;
    const lowerProjectType = project_type?.toLowerCase().trim();
    if (lowerProjectType === "new project") {
      normalizedProjectType = "New Project";
    } else if (lowerProjectType === "hybrid project") {
      normalizedProjectType = "Hybrid Project";
    } else if (lowerProjectType === "paid in advance") {
      normalizedProjectType = "Paid in Advance";
    }

    const RegSongRes = await songRegModel.insertHybridSong(
      oph_id,
      normalizedProjectType,
      name,
      release_date,
      lyricalVid === false ? false : true, // Convert to boolean
      available_on_music_platforms,
      next_step,
      projectsType,
      videoType,
      connection
    );

    if (RegSongRes) {
      // Use insertId from the insert result (auto-increment)
      const song_id = songRegModel.getSongIdFromInsert(RegSongRes);
      // Calendar entry is created only after payment is approved (calendar = source of truth for committed dates)
      // Initialize song_application_status entry with all statuses as 'pending'
      await SongApplicationStatusService.initializeSongApplicationStatus(
        connection,
        oph_id,
        song_id,
        name
      );

      // Paid in advance: sync status_payment from Date Booking if this date was pre-booked
      if (normalizedProjectType === "Paid in Advance" && release_date) {
        await SongApplicationStatusService.syncStatusPaymentFromDateBooking(
          connection,
          oph_id,
          song_id,
          release_date
        );
      }
      
      await connection.commit();

      return res.status(201).json({
        success: true,
        message: "Song Registered Successfully",
        contentID: song_id,
        song_id: song_id
      });
    }
  } catch (err) {
    await connection.rollback();
    console.error("Error in insertHybridSongRegDetails:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    connection.release();
  }
};

exports.getPendingSongsList = async (req, res) => {
  try {
    const { ophid } = req.query;
    
    if (!ophid) {
      return res.status(400).json({
        success: false,
        message: "Missing required field"
      });
    }

    // Use service to get songs with application logic
    const response = await SongRegistrationService.getPendingSongsList(ophid);

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: response
      });
    }
  } catch (err) {
    console.error('Error in getPendingSongsList:', err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
}

exports.updateSongStatusToDraft = async (req, res) => {
  try {
    const { song_id, oph_id } = req.body;

    if (!song_id || !oph_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: song_id and oph_id"
      });
    }

    const result = await songRegModel.updateSongStatusToDraft(song_id, oph_id);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "Song status updated to draft"
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Song not found"
      });
    }
  } catch (err) {
    console.error("Error updating song status:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

exports.updateSongNavigation = async (req, res) => {
  try {
    const { song_id, oph_id, next_page } = req.body;

    if (!song_id || !oph_id || !next_page) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: song_id, oph_id, and next_page"
      });
    }

    const result = await SongRegistrationService.updateSongNavigation(
      song_id,
      oph_id,
      next_page
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Song navigation updated successfully"
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Song not found"
      });
    }
  } catch (err) {
    console.error("Error updating song navigation:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * Check if a release date is still available for this user (not taken by someone else).
 * Used when opening a draft song: if the date was taken by another artist, user must pick a new date.
 * For "paid in advance" songs: user's own pre-booked dates (same oph_id) are considered available.
 */
exports.checkReleaseDateAvailable = async (req, res) => {
  try {
    const release_date = req.query.release_date || req.body.release_date;
    const oph_id = req.query.ophid || req.query.oph_id || req.body.ophid || req.body.oph_id || req.user?.ophid || req.user?.oph_id;
    if (!release_date) {
      return res.status(400).json({ success: false, message: "Missing release_date", available: false });
    }
    let dateStr = String(release_date).trim();
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) dateStr = parts.reverse().join("-").slice(0, 10);
      else dateStr = dateStr.slice(0, 10);
    } else {
      dateStr = dateStr.slice(0, 10);
    }
    if (dateStr === "0000-00-00" || !dateStr) {
      return res.status(200).json({ success: true, available: true });
    }
    // Date is taken only when ANOTHER artist (different oph_id) has it.
    // User's own pre-booked dates (paid in advance, same oph_id) are available for them.
    const [rows] = oph_id
      ? await db.execute(
          "SELECT 1 FROM calender WHERE current_booking_date = ? AND (oph_id IS NULL OR oph_id != ?) LIMIT 1",
          [dateStr, String(oph_id).trim()]
        )
      : await db.execute(
          "SELECT 1 FROM calender WHERE current_booking_date = ? LIMIT 1",
          [dateStr]
        );
    const available = rows.length === 0;
    return res.status(200).json({ success: true, available });
  } catch (err) {
    console.error("Error in checkReleaseDateAvailable:", err);
    return res.status(500).json({ success: false, available: false });
  }
};

/**
 * Update release_date for an existing song (e.g. when previous date was taken and user selects new one).
 */
exports.updateSongReleaseDate = async (req, res) => {
  try {
    const { song_id, oph_id, release_date } = req.body;
    if (!song_id || !oph_id || !release_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: song_id, oph_id, release_date"
      });
    }
    const dateStr = String(release_date).trim().slice(0, 10);
    if (dateStr === "0000-00-00") {
      return res.status(400).json({ success: false, message: "Invalid release_date" });
    }
    const result = await songRegModel.updateReleaseDate(song_id, oph_id, dateStr);
    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "Release date updated",
        release_date: dateStr
      });
    }
    return res.status(404).json({ success: false, message: "Song not found" });
  } catch (err) {
    console.error("Error in updateSongReleaseDate:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
