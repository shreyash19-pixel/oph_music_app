const { insertSongDetails, getAudioMeta, getSecondaryArtist, setNextPage, checkVideoDetailsStatus } = require("../model/audio_details");
const bucket = require("../utils.js");

const insertSongDetailsController = async (req, res) => {
  try {
    const {
      OPH_ID,
      song_id,
      Song_name,
      languages,
      genre,
      sub_genre,
      mood,
      lyrics,
      primary_artist,
      next_step
    } = req.body;

    if (!OPH_ID || !song_id || !Song_name || !languages || !genre || !sub_genre || !mood || !primary_artist || !next_step) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      })
    }

    const audio_file = req.file

    let audioPath = ''

    if (audio_file) {
      const fileURL = await bucket.uploadToS3(
        audio_file,
        `audio-meta/${OPH_ID}/audio-url`
      )
      if (fileURL) {
        audioPath = fileURL
      }
    }

    const result = await insertSongDetails(
      OPH_ID,
      song_id,
      Song_name,
      languages,
      genre,
      sub_genre,
      mood,
      lyrics,
      primary_artist,
      audioPath,
    );

    if (result) {
      await setNextPage(next_step, OPH_ID, song_id)
      res.status(201).json({ message: "Song details saved", result, song_id: song_id });
    }

  } catch (error) {
    console.error("Insert song detail error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getSongDetailsController = async (req, res) => {

  try {

    const { contentId, ophid } = req.query


    if (!contentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      })
    }

    const audioMeta = await getAudioMeta(contentId, ophid)

    const secondaryArtist = await getSecondaryArtist(contentId)

    if (audioMeta && secondaryArtist) {
      return res.status(200).json({
        success: true,
        data: {
          audio_metadata: audioMeta,
          secondary_artists: secondaryArtist
        }
      })
    }

  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }

}


const checkVideoDetailsStatusController = async (req, res) => {

  try{

      const {contentId} = req.query

      console.log(contentId);
      

      if(!contentId)
      {
        return res.status(400).json({
          success: false,
          message: "Missing required field"
        })
      }


      const response = await checkVideoDetailsStatus(contentId)

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
      message: err.message
    })
  }

}

module.exports = { insertSongDetailsController, getSongDetailsController, checkVideoDetailsStatusController };
