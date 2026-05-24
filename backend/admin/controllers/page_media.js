const { uploadToS3 } = require("../../utils");
const {
  getAllPageMedia,
  getPageMediaByName,
  updatePageMedia,
} = require("../model/page_media");

const getAllPageMediaController = async (req, res) => {
  try {
    const data = await getAllPageMedia();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPageMediaController = async (req, res) => {
  try {
    const { page_name } = req.query;
    if (!page_name) {
      return res
        .status(400)
        .json({ success: false, message: "page_name is required" });
    }
    const data = await getPageMediaByName(page_name);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const uploadPageMediaController = async (req, res) => {
  try {
    const { page_name } = req.body;
    const thumbnail = req.files?.thumbnail?.[0];
    const videoFromBody =
      req.body.video_url && String(req.body.video_url).trim();

    if (!page_name) {
      return res
        .status(400)
        .json({ success: false, message: "page_name is required" });
    }

    const existing = await getPageMediaByName(page_name);
    let thumbnailUrl = existing?.thumbnail_url || null;
    let videoUrl = existing?.video_url || null;

    if (thumbnail) {
      thumbnailUrl = await uploadToS3(
        thumbnail,
        `page-media/${page_name}/thumbnails`,
      );
    }

    if (videoFromBody) {
      videoUrl = videoFromBody;
    }

    await updatePageMedia(page_name, thumbnailUrl, videoUrl);

    return res.status(200).json({
      success: true,
      message: "Media uploaded successfully",
      data: { page_name, thumbnail_url: thumbnailUrl, video_url: videoUrl },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllPageMediaController,
  getPageMediaController,
  uploadPageMediaController,
};
