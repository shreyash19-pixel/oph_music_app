const {
  insertSpecialArtistSongs,
  getSpeicalArtistSongStatus,
  getIsSongFree,
  getSpeicalArtistSong
} = require("../model/special-artist-song");
const { uploadToS3 } = require("../utils.js");

const getSpeicalArtistSongStatusController = async (req, res) => {
  try {
    const { ophid } = req.query;

    // console.log(ophid, "ophid");

    if (!ophid) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await getSpeicalArtistSongStatus(ophid);
    const isSongFree = await getIsSongFree(ophid);

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: response,
        isSongFree: isSongFree,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


const getSpeicalArtistSongController = async (req, res) => {
  try {
    const { songId } = req.query;

    if (!songId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await getSpeicalArtistSong(songId);

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: response,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const insertSpecialArtistSongsController = async (req, res) => {
  try {
    const { songID, ophid, songName, views, credits, time, proof, songType, audioFile } = req.body;

    // Validate required fields
    if (!ophid || !songName || views == null || !credits || !time || !proof) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let audioURL = "";

    if (req.file) {
      const url = await uploadToS3(
        req.file, // pass file directly
        `special-artist-songs/${ophid}`
      );

      if (url) {
        audioURL = url;
      }
    }

    const response = await insertSpecialArtistSongs(
      songID,
      ophid,
      songName,
      views,
      credits,
      time,
      proof,
      songType,
      audioURL || audioFile
    );

    return res.status(201).json({
      success: true,
      message: "Data inserted successfully",
      data: response,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  insertSpecialArtistSongsController,
  getSpeicalArtistSongStatusController,
  getSpeicalArtistSongController
};
