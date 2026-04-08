const db = require("../DB/connect");
const { uploadToS3 } = require("../utils");

exports.uploadVideo = async (req, res) => {
  try {
    const { description } = req.body;
    const videoFile = req.file;

    if (!videoFile && (!description || !description.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide either a video file or a description"
      });
    }

    let videoUrl = null;
    if (videoFile) {
      videoUrl = await uploadToS3(videoFile, "uploaded-videos");
      if (!videoUrl) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload video to S3"
        });
      }
    }

    const connection = await db.getConnection();
    try {
      await connection.execute(
        `CREATE TABLE IF NOT EXISTS About_Us (
          about_us_video VARCHAR(500),
          about_us_desc LONGTEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      );

      // Alter existing table to change column type if needed
      try {
        await connection.execute(
          `ALTER TABLE About_Us MODIFY COLUMN about_us_desc LONGTEXT`
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
          `INSERT INTO About_Us (about_us_video, about_us_desc) VALUES (?, ?)`,
          [videoUrl, description ? description.trim() : null]
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
