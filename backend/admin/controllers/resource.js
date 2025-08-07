const Resource = require("../model/resource");

const fetchAllPodcast = async (req, res) => {
  try {
    const videos = await Resource.getAllPodcast();
    res.status(200).json({ success: true, data: videos });
  } catch (err) {
    console.error("Error fetching music videos:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch music videos" });
  }
};

const insertPodcast = async (req, res) => {
  try {
    const videoFile = req.files["video"]?.[0];
    const thumbnailFile = req.files["thumbnail"]?.[0];

    if (!videoFile || !thumbnailFile) {
      return res.status(400).json({
        success: false,
        message: "Both video and thumbnail are required",
      });
    }

    const {
      id,
      title,
      artist_name,
      duration_in_minutes,
      views,
      credit_name,
      keywords,
    } = req.body;

    const videoUrl = await uploadToS3(
      videoFile.buffer,
      videoFile.originalname,
      "videos",
      videoFile.mimetype,
    );
    const thumbnailUrl = await uploadToS3(
      thumbnailFile.buffer,
      thumbnailFile.originalname,
      "thumbnails",
      thumbnailFile.mimetype,
    );

    const insertId = await Resource.createPodcast({
      id: parseInt(id),
      title,
      videoUrl,
      thumbnailUrl,
      artist_name,
      duration_in_minutes: parseInt(duration_in_minutes),
      views: parseInt(views),
      credit_name,
      keywords,
    });

    res.status(201).json({
      success: true,
      message: "Music video added",
      id: insertId,
    });
  } catch (err) {
    console.error("Error inserting music video:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to add music video" });
  }
};
const fetchAllStories = async (req, res) => {
  try {
    const videos = await Resource.getAllStories();
    res.status(200).json({ success: true, data: videos });
  } catch (err) {
    console.error("Error fetching music videos:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch music videos" });
  }
};

const insertStories = async (req, res) => {
  try {
    const videoFile = req.files["video"]?.[0];
    const thumbnailFile = req.files["thumbnail"]?.[0];

    if (!videoFile || !thumbnailFile) {
      return res.status(400).json({
        success: false,
        message: "Both video and thumbnail are required",
      });
    }

    const {
      id,
      title,
      artist_name,
      duration_in_minutes,
      views,
      credit_name,
      keywords,
    } = req.body;

    const videoUrl = await uploadToS3(
      videoFile.buffer,
      videoFile.originalname,
      "videos",
      videoFile.mimetype,
    );
    const thumbnailUrl = await uploadToS3(
      thumbnailFile.buffer,
      thumbnailFile.originalname,
      "thumbnails",
      thumbnailFile.mimetype,
    );

    const insertId = await Resource.createStories({
      id: parseInt(id),
      title,
      videoUrl,
      thumbnailUrl,
      artist_name,
      duration_in_minutes: parseInt(duration_in_minutes),
      views: parseInt(views),
      credit_name,
      keywords,
    });

    res.status(201).json({
      success: true,
      message: "Music video added",
      id: insertId,
    });
  } catch (err) {
    console.error("Error inserting music video:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to add music video" });
  }
};

const fetchAllReels = async (req, res) => {
  try {
    const videos = await Resource.getAllReels();
    res.status(200).json({ success: true, data: videos });
  } catch (err) {
    console.error("Error fetching music videos:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch music videos" });
  }
};

const insertReels = async (req, res) => {
  try {
    const videoFile = req.files["video"]?.[0];
    const thumbnailFile = req.files["thumbnail"]?.[0];

    if (!videoFile || !thumbnailFile) {
      return res.status(400).json({
        success: false,
        message: "Both video and thumbnail are required",
      });
    }

    const {
      id,
      title,
      artist_name,
      duration_in_minutes,
      views,
      credit_name,
      keywords,
    } = req.body;

    const videoUrl = await uploadToS3(
      videoFile.buffer,
      videoFile.originalname,
      "videos",
      videoFile.mimetype,
    );
    const thumbnailUrl = await uploadToS3(
      thumbnailFile.buffer,
      thumbnailFile.originalname,
      "thumbnails",
      thumbnailFile.mimetype,
    );

    const insertId = await Resource.createReel({
      id: parseInt(id),
      title,
      videoUrl,
      thumbnailUrl,
      artist_name,
      duration_in_minutes: parseInt(duration_in_minutes),
      views: parseInt(views),
      credit_name,
      keywords,
    });

    res.status(201).json({
      success: true,
      message: "Music video added",
      id: insertId,
    });
  } catch (err) {
    console.error("Error inserting music video:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to add music video" });
  }
};

module.exports = {
  insertPodcast,
  fetchAllPodcast,
  insertReels,
  fetchAllReels,
  insertStories,
  fetchAllStories,
};
