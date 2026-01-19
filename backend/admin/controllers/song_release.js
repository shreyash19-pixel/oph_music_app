const {
  getSongReleaseList,
  getIndividualSongReleaseList,
  setSongReleaseDetails,
  getSpecialArtist
} = require("../model/song_release");

const getSongReleaseListController = async (req, res) => {
  try {
    const response = await getSongReleaseList();

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched Successfully",
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

const getIndividualSongReleaseListController = async (req, res) => {
  try {
    const { ophid, songId } = req.query;

    if (!ophid || !songId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await getIndividualSongReleaseList(ophid, songId);

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched Successfully",
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

const setSongReleaseDetailsController = async (req, res) => {
  try {
    const {
      ophid,
      songId,
      release_time,
      youtube_release_time,
      spotify_release_time,
      apple_release_time,
      instagram_release_time,
      facebook_release_time,
      share_url,
      youtube_url,
      spotify_url,
      apple_url,
      instagram_url,
      facebook_url,
    } = req.body;

    if (
      !ophid ||
      !songId ||
      !release_time ||
      !youtube_release_time ||
      !spotify_release_time ||
      !apple_release_time ||
      !instagram_release_time ||
      !facebook_release_time ||
      !share_url ||
      !youtube_url ||
      !spotify_url ||
      !apple_url ||
      !instagram_url ||
      !facebook_url
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await setSongReleaseDetails(
      ophid,
      songId,
      release_time,
      youtube_release_time,
      spotify_release_time,
      apple_release_time,
      instagram_release_time,
      facebook_release_time,
      share_url,
      youtube_url,
      spotify_url,
      apple_url,
      instagram_url,
      facebook_url
    );

    if (response) {
      return res.status(201).json({
        success: true,
        message: "Data updated successfully",
      });
    }
  } catch (err) {
    return res.status(err.message);
  }
};

module.exports = {
  getSongReleaseListController,
  getIndividualSongReleaseListController,
  setSongReleaseDetailsController,
};
