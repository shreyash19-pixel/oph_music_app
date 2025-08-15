const Resource = require("../model/resource");
const bucket = require("../../utils");

const searchPodcasts = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.json({ data: [] });
  }

  try {
    const results = await Resource.search(q);
    res.json({ data: results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

const fetchAllPodcast = async (req, res) => {
  try {
    const videos = await Resource.getAllPodcast();
    res.status(200).json({ success: true, data: videos });
  } catch (err) {
    console.error("Error fetching Podcast:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch Podcast" });
  }
};

const insertPodcast = async (req, res) => {
  try {
    const videoFile = req.files["video_url"]?.[0];
    const thumbnailFile = req.files["thumbnail_url"]?.[0];

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

    console.log(req.body, "body from podcast");
    console.log(req.files, "body from podcast");
    const videoUrl = await bucket.uploadToS3(videoFile, "Resource/Podcast");
    console.log(videoUrl);
    const thumbnailUrl = await bucket.uploadToS3(
      thumbnailFile,
      "Resource/Podcast",
    );

    const insertId = await Resource.createPodcast({
      id: parseInt(id),
      title,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      artist_name,
      duration_in_minutes: parseInt(duration_in_minutes),
      views: parseInt(views),
      credit_name,
      keywords,
    });

    res.status(201).json({
      success: true,
      message: "Podcast added",
      id: insertId,
    });
  } catch (err) {
    console.error("Error Podcast not uploaded:", err);
    res
      .status(500)
      .json({ success: false, message: "Error Podcast not uploaded" });
  }
};

const getPodcastById = async (req, res) => {
  try {
    const { podcastId } = req.params;

    if (!podcastId || isNaN(podcastId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing podcast ID",
      });
    }

    const podcast = await Resource.getPodcastById(parseInt(podcastId));

    if (!podcast) {
      return res.status(404).json({
        success: false,
        message: "Podcast not found",
      });
    }

    res.status(200).json({
      success: true,
      data: podcast,
    });
  } catch (err) {
    console.error("Error fetching podcast:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updatePodcastById = async (req, res) => {
  try {
    const { podcastId } = req.params;
    const videoFile = req.files?.["video_url"]?.[0];
    const thumbnailFile = req.files?.["thumbnail_url"]?.[0];

    const {
      title,
      artist_name,
      duration_in_minutes,
      views,
      credit_name,
      keywords,
      video_url,
      thumbnail_url,
    } = req.body;

    const updateData = {};

    if (title) updateData.title = title;
    if (artist_name) updateData.artist_name = artist_name;
    if (duration_in_minutes)
      updateData.duration_in_minutes = parseInt(duration_in_minutes);
    if (views) updateData.views = parseInt(views);
    if (credit_name) updateData.credit_name = credit_name;
    if (keywords) updateData.keywords = keywords;

    if (videoFile) {
      updateData.video_url = await bucket.uploadToS3(
        videoFile,
        "Resource/Podcast",
      );
    } else if (video_url) {
      updateData.video_url = video_url;
    }

    if (thumbnailFile) {
      updateData.thumbnail_url = await bucket.uploadToS3(
        thumbnailFile,
        "Resource/Podcast",
      );
    } else if (thumbnail_url) {
      updateData.thumbnail_url = thumbnail_url;
    }

    const success = await Resource.updatePodcastById(podcastId, updateData);

    if (!success) {
      return res
        .status(404)
        .json({ success: false, message: "Podcast not found" });
    }

    res.status(200).json({
      success: true,
      message: "Podcast updated successfully",
    });
  } catch (err) {
    console.error("Error updating podcast:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const deletePodcast = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await Resource.deletePodcastById(id);
    if (!success) {
      return res.status(404).json({ message: "Podcast not found." });
    }
    res.json({ message: "Podcast deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting podcast.", error: err });
  }
};

//Stories

const fetchAllStories = async (req, res) => {
  try {
    const videos = await Resource.getAllStories();
    res.status(200).json({ success: true, data: videos });
  } catch (err) {
    console.error("Error fetching Story:", err);
    res.status(500).json({ success: false, message: "Failed to fetch Story" });
  }
};

const insertStories = async (req, res) => {
  try {
    const videoFile = req.files["video_url"]?.[0];
    const thumbnailFile = req.files["thumbnail_url"]?.[0];

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

    const videoUrl = await bucket.uploadToS3(videoFile, "Resource/Stories");
    const thumbnailUrl = await bucket.uploadToS3(
      thumbnailFile,
      "Resource/Stories",
    );

    const insertId = await Resource.createStories({
      id: parseInt(id),
      title,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      artist_name,
      duration_in_minutes: parseInt(duration_in_minutes),
      views: parseInt(views),
      credit_name,
      keywords,
    });

    res.status(201).json({
      success: true,
      message: "Story added",
      id: insertId,
    });
  } catch (err) {
    console.error("Error inserting Story:", err);
    res.status(500).json({ success: false, message: "Failed to add Story" });
  }
};

const updateStroyById = async (req, res) => {
  try {
    const { podcastId } = req.params;
    const videoFile = req.files?.["video_url"]?.[0];
    const thumbnailFile = req.files?.["thumbnail_url"]?.[0];

    const {
      title,
      artist_name,
      duration_in_minutes,
      views,
      credit_name,
      keywords,
      video_url,
      thumbnail_url,
    } = req.body;

    const updateData = {};

    if (title) updateData.title = title;
    if (artist_name) updateData.artist_name = artist_name;
    if (duration_in_minutes)
      updateData.duration_in_minutes = parseInt(duration_in_minutes);
    if (views) updateData.views = parseInt(views);
    if (credit_name) updateData.credit_name = credit_name;
    if (keywords) updateData.keywords = keywords;

    if (videoFile) {
      updateData.video_url = await bucket.uploadToS3(
        videoFile,
        "Resource/Stories",
      );
    } else if (video_url) {
      updateData.video_url = video_url;
    }

    if (thumbnailFile) {
      updateData.thumbnail_url = await bucket.uploadToS3(
        thumbnailFile,
        "Resource/Stories",
      );
    } else if (thumbnail_url) {
      updateData.thumbnail_url = thumbnail_url;
    }

    const success = await Resource.updatePodcastById(podcastId, updateData);

    if (!success) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    res.status(200).json({
      success: true,
      message: "Story updated successfully",
    });
  } catch (err) {
    console.error("Error updating Story:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const deleteStory = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await Resource.deleteStoryById(id);
    if (!success) {
      return res.status(404).json({ message: "Story not found." });
    }
    res.json({ message: "Story deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting Story.", error: err });
  }
};
const getStroyById = async (req, res) => {
  try {
    const { storyId } = req.params;

    if (!storyId || isNaN(storyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing story Id",
      });
    }

    const story = await Resource.getStoryById(parseInt(storyId));

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    res.status(200).json({
      success: true,
      data: story,
    });
  } catch (err) {
    console.error("Error fetching Story:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reels
const fetchAllReels = async (req, res) => {
  try {
    const videos = await Resource.getAllReels();
    res.status(200).json({ success: true, data: videos });
  } catch (err) {
    console.error("Error fetching Reel:", err);
    res.status(500).json({ success: false, message: "Failed to fetch Reel" });
  }
};

const insertReels = async (req, res) => {
  try {
    const videoFile = req.files["video_url"]?.[0];
    const thumbnailFile = req.files["thumbnail_url"]?.[0];

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

    const videoUrl = await bucket.uploadToS3(videoFile, "Resource/Reels");
    const thumbnailUrl = await bucket.uploadToS3(
      thumbnailFile,
      "Resource/Reels",
    );

    const insertId = await Resource.createReel({
      id: parseInt(id),
      title,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      artist_name,
      duration_in_minutes: parseInt(duration_in_minutes),
      views: parseInt(views),
      credit_name,
      keywords,
    });

    res.status(201).json({
      success: true,
      message: "Reel added",
      id: insertId,
    });
  } catch (err) {
    console.error("Error inserting Reel:", err);
    res.status(500).json({ success: false, message: "Failed to add Reel" });
  }
};

const updateReelById = async (req, res) => {
  try {
    const { reelId } = req.params;
    const videoFile = req.files?.["video_url"]?.[0];
    const thumbnailFile = req.files?.["thumbnail_url"]?.[0];

    const {
      title,
      artist_name,
      duration_in_minutes,
      views,
      credit_name,
      keywords,
      video_url,
      thumbnail_url,
    } = req.body;

    const updateData = {};

    if (title) updateData.title = title;
    if (artist_name) updateData.artist_name = artist_name;
    if (duration_in_minutes)
      updateData.duration_in_minutes = parseInt(duration_in_minutes);
    if (views) updateData.views = parseInt(views);
    if (credit_name) updateData.credit_name = credit_name;
    if (keywords) updateData.keywords = keywords;

    if (videoFile) {
      updateData.video_url = await bucket.uploadToS3(
        videoFile,
        "Resource/Reel",
      );
    } else if (video_url) {
      updateData.video_url = video_url;
    }

    if (thumbnailFile) {
      updateData.thumbnail_url = await bucket.uploadToS3(
        thumbnailFile,
        "Resource/Reel",
      );
    } else if (thumbnail_url) {
      updateData.thumbnail_url = thumbnail_url;
    }

    const success = await Resource.updateReelById(reelId, updateData);

    if (!success) {
      return res
        .status(404)
        .json({ success: false, message: "Reel not found" });
    }

    res.status(200).json({
      success: true,
      message: "Reel updated successfully",
    });
  } catch (err) {
    console.error("Error updating Reel:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const deleteReel = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await Resource.deleteReelById(id);
    if (!success) {
      return res.status(404).json({ message: "Reel not found." });
    }
    res.json({ message: "Reel deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting podcast.", error: err });
  }
};

const getReelById = async (req, res) => {
  try {
    const { reelId } = req.params;

    if (!reelId || isNaN(reelId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Reel ID",
      });
    }

    const reel = await Resource.getReelById(parseInt(reelId));

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found",
      });
    }

    res.status(200).json({
      success: true,
      data: reel,
    });
  } catch (err) {
    console.error("Error fetching Reel:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  searchPodcasts,
  getPodcastById,
  insertPodcast,
  fetchAllPodcast,
  updatePodcastById,
  deletePodcast,
  //Reels
  insertReels,
  fetchAllReels,
  getReelById,
  updateReelById,
  deleteReel,
  //Stories
  insertStories,
  fetchAllStories,
  updateStroyById,
  getStroyById,
  deleteStory,
};
