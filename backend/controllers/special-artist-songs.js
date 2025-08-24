const { insertSpecialArtistSongs, getSpeicalArtistSongStatus } = require("../model/special-artist-song");
const { uploadToS3 } = require("../utils.js");

const getSpeicalArtistSongStatusController = async (req, res) => {


    try{

        const {ophid} = req.query

        console.log(ophid, 'ophid');
        

        if(!ophid)
        {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            })
        }

        const response = await getSpeicalArtistSongStatus(ophid)

        if(response)
        {
            return res.status(200).json({
                success: true,
                message: "Data fetched successfully",
                data: response
            })
        }

    }catch(err)
    {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }

}

const insertSpecialArtistSongsController = async (req, res) => {
  try {
    const { ophid, songName, views, credits, time, proof } = req.body;
    let audioURL = "";
    if (
      !ophid ||
      !songName ||
      !views ||
      !credits ||
      !time ||
      !proof
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const { audioFile } = req.file;

    if (audioFile) {
      const url = await uploadToS3(audioFile, `special-artist-songs/${ophid}`);

      if (url) {
        audioURL = url
      }
    }

    const response = await insertSpecialArtistSongs(
      ophid,
      songName,
      views,
      credits,
      time,
      proof,
      audioURL
    );

    if (response) {
      return res.status(201).json({
        success: true,
        message: "Data inserted successfully",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { insertSpecialArtistSongsController, getSpeicalArtistSongStatusController };
