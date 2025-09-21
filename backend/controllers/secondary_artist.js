// controllers/secondaryArtistController.js
const secondaryArtist = require("../model/secondary_artist.js"); // ⬅︎ create this model next
const user_details = require("../model/professional_details.js");
const { uploadToS3 } = require("../utils");

const insertSecondaryArtist = async (req, res) => {

  try {
    const {
      song_id,
      artist_type,
      artist_name,
      legal_name,
      spotify_url,
      facebook_url,
      instagram_url,
      apple_music_url
    } = req.body

    const profileImg = req.file
    let imageURL = ''

    if (profileImg) {
      const storeImgBucket = await uploadToS3(profileImg, `secondary-artist/${song_id}/profile_image`)

      if (storeImgBucket) {
        imageURL = storeImgBucket
      }
    }

    const response = await secondaryArtist.insertSecondaryArtist(
      song_id,
      artist_type,
      artist_name,
      legal_name,
      imageURL,
      spotify_url,
      facebook_url,
      instagram_url,
      apple_music_url
    )

    if (response) {
      return res.status(201).json({
        success: true,
        message: "Data inserted successfully"
      })
    }
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }

};

const removeSecondaryArtist = async (req, res) => {

  try {
    const {
      song_id,
      artist_type,
      artist_name,
      legal_name
    } = req.body


    if (!song_id || !artist_type || !artist_name || !legal_name) {
      return res.status(400).json({
        success: false,
        message: "Missing requied fields"
      })
    }

    const response = await secondaryArtist.removeSecondaryArtist(
      song_id,
      artist_type,
      artist_name,
      legal_name
    )

    if(response)
    {
      return res.status(201).json({
        success: true,
        message: "Secondary artist removed successfully"
      })
    }

  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    })

  }

}

// -----------------------------------------------------------------------------
// PUT /secondary-artists            ➜ update an existing secondary artist row
// -----------------------------------------------------------------------------
const updateSecondaryArtist = async (req, res) => {
  try {
    const {
      OPH_ID,
      artist_type,
      artist_name,
      Legal_name,
      artistPictureUrl,
      SpotifyLink,
      InstagramLink,
      FacebookLink,
      AppleMusicLink,
    } = req.body;

    if (!OPH_ID || !artist_type) {
      return res
        .status(400)
        .json({ success: false, message: "OPH_ID and artist_type are required" });
    }

    /* grab the existing row so we can keep the old picture URL if no file sent */
    const existing = await secondaryArtist.getByOphIdAndType(OPH_ID, artist_type);
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Secondary artist not found" });
    }

    //const pictureFile      = req.files?.artistPicture?.[0];
    // const artistPictureUrl = pictureFile
    //   ? await uploadToS3(pictureFile, "images")
    //   : existing[0].artist_picture_url;

    const dbResponse = await secondaryArtist.updateSecondaryArtist(
      OPH_ID,
      artist_type,
      artist_name,
      Legal_name,
      artistPictureUrl,
      SpotifyLink,
      InstagramLink,
      FacebookLink,
      AppleMusicLink
    );

    if (dbResponse) {
      return res
        .status(200)
        .json({ success: true, message: "Secondary artist updated successfully" });
    }

    return res
      .status(500)
      .json({ success: false, message: "Failed to update secondary artist" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// -----------------------------------------------------------------------------
// GET /secondary-artists?ophid=123  ➜ list all secondary artists for an OPH_ID
// -----------------------------------------------------------------------------
const getSecondaryArtistsByOphId = async (req, res) => {
  try {
    const { OPH_ID } = req.query;
    const data = await secondaryArtist.getSecondaryArtistsByOphId(OPH_ID);

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Data not found for the given OPH_ID" });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: error.message });

  }
};

// const user = await secondaryArtist.getSecondaryArtistsByOphId(OPH_ID);
// if (user.length === 0) {
//   return res.status(404).json({
//     success: false,
//     message: "User not found",
//   });
// }



module.exports = {
  insertSecondaryArtist,
  updateSecondaryArtist,
  removeSecondaryArtist,
  getSecondaryArtistsByOphId,
};
