const songRegModel = require("../model/songs_register");


exports.insertNewSongRegDetails = async (req, res) => {
  try {
    const { oph_id, project_type, name, release_date, lyricalVid, next_step } = req.body;

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
      lyricalVid === false ? "base" : "base + lyrics",
      lyricalVid === false ? 0 : 1,
      next_step
    );

    if (RegSongRes) {

      const song_id = await songRegModel.getSongID(name)
      
      return res.status(201).json({
        success: true,
        message: "Song Registered Successfully",
        contentID : song_id[0].song_id
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.insertHybridSongRegDetails = async (req, res) => {
  try {
    const { oph_id, project_type, name, release_date, lyricalVid, available_on_music_platforms } = req.body;

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
      lyricalVid === false ? "base" : "base + lyrics",
      lyricalVid === false ? 0 : 1,
      available_on_music_platforms
    );

    if (RegSongRes) {

      const song_id = await songRegModel.getSongID(name)

      return res.status(201).json({
        success: true,
        message: "Song Registered Successfully",
        contentID : song_id[0].song_id
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
    return res.status(500).json({
      success: false,
      message: err
    })
  }

}
