const db = require("../DB/connect");
const { uploadToS3 } = require("../utils");

exports.uploadVideo = async (req, res) => {
  try {
    const { description } = req.body;
    const videoFile = req.files?.video?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!videoFile && !thumbnailFile && (!description || !description.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least a video, thumbnail, or description"
      });
    }

    let videoUrl = null;
    let thumbnailUrl = null;

    if (videoFile) {
      videoUrl = await uploadToS3(videoFile, "uploaded-videos");
      if (!videoUrl) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload video to S3"
        });
      }
    }

    if (thumbnailFile) {
      thumbnailUrl = await uploadToS3(thumbnailFile, "uploaded-videos/thumbnails");
      if (!thumbnailUrl) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload thumbnail to S3"
        });
      }
    }

    const connection = await db.getConnection();
    try {
      await connection.execute(
        `CREATE TABLE IF NOT EXISTS About_Us (
          about_us_video VARCHAR(500),
          about_us_thumbnail VARCHAR(500),
          about_us_desc LONGTEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      );

      try {
        await connection.execute(
          `ALTER TABLE About_Us MODIFY COLUMN about_us_desc LONGTEXT`
        );
      } catch (alterError) {
        // Ignore error if column already has correct type
      }

      try {
        await connection.execute(
          `ALTER TABLE About_Us ADD COLUMN about_us_thumbnail VARCHAR(500)`
        );
      } catch (alterError) {
        // Ignore error if column already exists
      }

      try {
        await connection.execute(
          `ALTER TABLE About_Us MODIFY COLUMN about_us_thumbnail VARCHAR(500)`
        );
      } catch (alterError) {
        // Ignore error if column already has correct type
      }

      const [existing] = await connection.execute(`SELECT * FROM About_Us LIMIT 1`);
      
      if (existing.length > 0) {
        const updates = [];
        const values = [];
        
        if (videoUrl) {
          updates.push('about_us_video = ?');
          values.push(videoUrl);
        }
        if (thumbnailUrl) {
          updates.push('about_us_thumbnail = ?');
          values.push(thumbnailUrl);
        }
        if (description && description.trim()) {
          updates.push('about_us_desc = ?');
          values.push(description.trim());
        }
        
        if (updates.length > 0) {
          await connection.execute(
            `UPDATE About_Us SET ${updates.join(', ')}`,
            values
          );
        }
      } else {
        await connection.execute(
          `INSERT INTO About_Us (about_us_video, about_us_thumbnail, about_us_desc) VALUES (?, ?, ?)`,
          [videoUrl, thumbnailUrl, description ? description.trim() : null]
        );
      }
    } finally {
      connection.release();
    }

    res.status(201).json({
      success: true,
      message: "Data uploaded successfully",
      data: {
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        description: description ? description.trim() : null
      }
    });

  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};
