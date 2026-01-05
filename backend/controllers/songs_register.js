const songRegModel = require("../model/songs_register");


exports.insertNewSongRegDetails = async (req, res) => {
  try {
    const { oph_id, project_type, name, release_date, lyricalVid, next_step, videoType, } = req.body;

    if (!oph_id || !project_type || !name || !release_date || !next_step) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const RegSongRes = await songRegModel.insertNewSong(
      oph_id,
      project_type,
      name,
      release_date,
      lyricalVid === false ? false : true, // Convert to boolean
      next_step,
      videoType
    );

    if (RegSongRes) {
      // Use insertId from the insert result (auto-increment)
      const song_id = songRegModel.getSongIdFromInsert(RegSongRes);
      
      return res.status(201).json({
        success: true,
        message: "Song Registered Successfully",
        contentID: song_id,
        song_id: song_id
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.insertHybridSongRegDetails = async (req, res) => {
  try {
    const { oph_id, project_type, name, release_date, lyricalVid, available_on_music_platforms, next_step, projectsType, videoType } = req.body;

    console.log(req.body);

    if (!oph_id || !project_type || !name || !release_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const RegSongRes = await songRegModel.insertHybridSong(
      oph_id,
      project_type,
      name,
      release_date,
      lyricalVid === false ? false : true, // Convert to boolean
      available_on_music_platforms,
      next_step,
      projectsType,
      videoType
    );

    if (RegSongRes) {
      // Use insertId from the insert result (auto-increment)
      const song_id = songRegModel.getSongIdFromInsert(RegSongRes);

      return res.status(201).json({
        success: true,
        message: "Song Registered Successfully",
        contentID: song_id,
        song_id: song_id
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPendingSongsList = async (req, res) => {

  try{
    const {ophid} = req.query
    if(!ophid)
    {
      return res.status(400).json({
        success: false,
        message: "Missing required field"
      })
    }

    const response = await songRegModel.getPendingSongsList(ophid)

    if(response)
    {
      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: response
      })
    }
  }
  catch(err)
  {
    console.error('Error in getPendingSongsList:', err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    })
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
