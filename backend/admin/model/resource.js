const db = require("../../DB/connect");

const Resource = {
  // Fetch all music videos
  getAllPodcast: async () => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM resource_podcast ORDER BY created_at DESC",
      );
      return rows;
    } catch (err) {
      console.error("Error in getAllMusicVideos:", err);
      throw err;
    }
  },

  // Insert a new music video
  createPodcast: async (videoData) => {
    try {
      const {
        id,
        title,
        video_url,
        thumbnail_url,
        artist_name,
        duration_in_minutes,
        views,
        credit_name,
        keywords,
      } = videoData;

      const [result] = await db.query(
        `INSERT INTO resource_podcast
         (id, title, video_url, thumbnail_url, artist_name, duration_in_minutes, views, credit_name, keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          title,
          video_url,
          thumbnail_url,
          artist_name,
          duration_in_minutes,
          views,
          credit_name,
          keywords,
        ],
      );

      return result.insertId;
    } catch (err) {
      console.error("Error in createMusicVideo:", err);
      throw err;
    }
  },

  getAllReels: async () => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM resource_reels ORDER BY created_at DESC",
      );
      return rows;
    } catch (err) {
      console.error("Error in getAllMusicVideos:", err);
      throw err;
    }
  },

  // Insert a new music video
  createReel: async (videoData) => {
    try {
      const {
        id,
        title,
        video_url,
        thumbnail_url,
        artist_name,
        duration_in_minutes,
        views,
        credit_name,
        keywords,
      } = videoData;

      const [result] = await db.query(
        `INSERT INTO resource_reels
         (id, title, video_url, thumbnail_url, artist_name, duration_in_minutes, views, credit_name, keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          title,
          video_url,
          thumbnail_url,
          artist_name,
          duration_in_minutes,
          views,
          credit_name,
          keywords,
        ],
      );

      return result.insertId;
    } catch (err) {
      console.error("Error in createMusicVideo:", err);
      throw err;
    }
  },

  getAllStories: async () => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM resource_story ORDER BY created_at DESC",
      );
      return rows;
    } catch (err) {
      console.error("Error in getAllMusicVideos:", err);
      throw err;
    }
  },

  // Insert a new music video
  createStories: async (videoData) => {
    try {
      const {
        id,
        title,
        video_url,
        thumbnail_url,
        artist_name,
        duration_in_minutes,
        views,
        credit_name,
        keywords,
      } = videoData;

      const [result] = await db.query(
        `INSERT INTO resource_story
         (id, title, video_url, thumbnail_url, artist_name, duration_in_minutes, views, credit_name, keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          title,
          video_url,
          thumbnail_url,
          artist_name,
          duration_in_minutes,
          views,
          credit_name,
          keywords,
        ],
      );

      return result.insertId;
    } catch (err) {
      console.error("Error in createMusicVideo:", err);
      throw err;
    }
  },
};

module.exports = Resource;
