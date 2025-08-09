const db = require("../../DB/connect");

const Resource = {
  search: async (q) => {
    const query = `
      (
          SELECT id, title, artist_name, thumbnail_url, views
          FROM resource_podcast
          WHERE title LIKE CONCAT('%', ?, '%')
             OR artist_name LIKE CONCAT('%', ?, '%')
             OR credit_name LIKE CONCAT('%', ?, '%')
             OR keywords LIKE CONCAT('%', ?, '%')
      )
      UNION
      (
          SELECT id, title, artist_name, thumbnail_url, views
          FROM resource_story
          WHERE title LIKE CONCAT('%', ?, '%')
             OR artist_name LIKE CONCAT('%', ?, '%')
             OR credit_name LIKE CONCAT('%', ?, '%')
             OR keywords LIKE CONCAT('%', ?, '%')
      )
      UNION
      (
          SELECT id, title, artist_name, thumbnail_url, views
          FROM resource_reels
          WHERE title LIKE CONCAT('%', ?, '%')
             OR artist_name LIKE CONCAT('%', ?, '%')
             OR credit_name LIKE CONCAT('%', ?, '%')
             OR keywords LIKE CONCAT('%', ?, '%')
      )
      ORDER BY views DESC
      LIMIT 20
      `;

    const [rows] = await db.execute(query, [q, q, q, q]);
    return rows;
  },

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

  getPodcastById: async (podcastId) => {
    const [rows] = await db.query(
      `SELECT id, title, video_url, thumbnail_url, artist_name, duration_in_minutes, views, credit_name, keywords
         FROM resource_podcast
         WHERE id = ?`,
      [podcastId],
    );
    return rows[0] || null;
  },

  updatePodcastById: async (podcastId, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }

    values.push(podcastId); // for WHERE clause

    const [result] = await db.query(
      `UPDATE resource_podcast SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return result.affectedRows > 0;
  }, // Insert a new music video
  createPodcast: async (videoData) => {
    try {
      const {
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
         ( title, video_url, thumbnail_url, artist_name, duration_in_minutes, views, credit_name, keywords)
         VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
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

  deletePodcastById: async (podcastId) => {
    try {
      const [result] = await db.query(
        "DELETE FROM resource_podcast WHERE id = ?",
        [podcastId],
      );
      return result.affectedRows > 0;
    } catch (err) {
      console.error("Error in deletePodcastById:", err);
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

  getReelById: async (reelId) => {
    const [rows] = await db.query(
      `SELECT id, title, video_url, thumbnail_url, artist_name, duration_in_minutes, views, credit_name, keywords
         FROM resource_reels
         WHERE id = ?`,
      [reelId],
    );
    return rows[0] || null;
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

  updateReelById: async (reelId, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }

    values.push(reelId); // for WHERE clause

    const [result] = await db.query(
      `UPDATE resource_reels SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return result.affectedRows > 0;
  },

  deleteReelById: async (podcastId) => {
    try {
      const [result] = await db.query(
        "DELETE FROM resource_podcast WHERE id = ?",
        [podcastId],
      );
      return result.affectedRows > 0;
    } catch (err) {
      console.error("Error in deletePodcastById:", err);
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

  getStoryById: async (storyId) => {
    const [rows] = await db.query(
      `SELECT id, title, video_url, thumbnail_url, artist_name, duration_in_minutes, views, credit_name, keywords
           FROM resource_story
           WHERE id = ?`,
      [storyId],
    );
    return rows[0] || null;
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

  updateStoryById: async (podcastId, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }

    values.push(podcastId); // for WHERE clause

    const [result] = await db.query(
      `UPDATE resource_podcast SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return result.affectedRows > 0;
  }, // Insert a new music video

  deleteStoryById: async (podcastId) => {
    try {
      const [result] = await db.query(
        "DELETE FROM resource_podcast WHERE id = ?",
        [podcastId],
      );
      return result.affectedRows > 0;
    } catch (err) {
      console.error("Error in deletePodcastById:", err);
      throw err;
    }
  },
};

module.exports = Resource;
