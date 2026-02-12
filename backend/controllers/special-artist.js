const {
  editSpecialArtistDetails,
  getSpecialArtistStatus,
  getSpecialArtistPic
} = require("../model/special-artisit");
const { uploadToS3 } = require("../utils");

const getSpecialArtistStatusController = async (req, res) => {
  try {
    const { ophid } = req.query;

    if (!ophid) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await getSpecialArtistStatus(ophid);

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

const getSpecialArtistPicController = async (req, res) => {
  try {
    const { ophid } = req.query;

    if (!ophid) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await getSpecialArtistPic(ophid);

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

const editSpecialArtistDetailsController = async (req, res) => {
  try {
    const { ophid } = req.body;
    let updates = [];

    if (!ophid) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (req.body.bio) {
      updates.push({
        ophid: ophid,
        field: "Bio",
        content: req.body.bio,
      });
    }

    if (req.body.artistStory) {
      updates.push({
        ophid: ophid,
        field: "Artist Story",
        content: req.body.artistStory,
      });
    }

    if (req.files && req.files.bioVideo) {
      const url = await uploadToS3(
        req.files.bioVideo[0],
        `special-artist/${ophid}/bioVideo`
      );

      if (url) {
        updates.push({
          ophid: ophid,
          field: "Video Bio",
          content: url,
        });
      }
    }

    if (req.files && req.files.artistStoryVideo) {
      const url = await uploadToS3(
        req.files.artistStoryVideo[0],
        `special-artist/${ophid}/artistStoryVideo`
      );

      if (url) {
        updates.push({
          ophid: ophid,
          field: "Artist Story Vid",
          content: url,
        });
      }
    }

    if (req.files && req.files.artistPhoto) {
      const url = await uploadToS3(
        req.files.artistPhoto[0],
        `special-artist/${ophid}/artistPhoto`
      );

      if (url) {
        updates.push({
          ophid: ophid,
          field: "Artist Photo",
          content: url,
        });
      }
    }

    if (req.files && req.files.updateImages) {
      const url = await uploadToS3(
        req.files.updateImages[0],
        `special-artist/${ophid}/updateImages`
      );

      if (url) {
        updates.push({
          ophid: ophid,
          field: "Image update",
          content: url,
        });
      }
    }

    if (updates.length > 0) {
      const response = await editSpecialArtistDetails(updates, updates.length);

      if (response) {
        return res.status(201).json({
          success: true,
          message: "Data inserted successfully",
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  editSpecialArtistDetailsController,
  getSpecialArtistStatusController,
  getSpecialArtistPicController
};
