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
      
      // Initialize song_application_status entry with all statuses as 'pending'
      await SongApplicationStatusService.initializeSongApplicationStatus(
        connection,
        oph_id,
        song_id,
        name
      );
      
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

      // Initialize song_application_status entry with all statuses as 'pending'
      await SongApplicationStatusService.initializeSongApplicationStatus(
        connection,
        oph_id,
        song_id,
        name
      );
      
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
}
