const songsModel = require("../model/songs");
const { saveNotification } = require("../../utils/notify");
const { uploadToS3 } = require("../../utils");

getAll = async (req, res) => {
  try {
    const songs = await songsModel.getAllSongs();
    res.status(200).json({
      success: true,
      data: songs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch songs",
    });
  }
};

const getSongsUnderReview = async (req, res) => {
  try {
    const { ophId, songId } = req.params;
    console.log("Params:", req.params);

    if (!ophId || !songId) {
      return res
        .status(400)
        .json({ message: "OPH_ID and songId are required" });
    }

    const data = await songsModel.getSongsByOphIdUnderReview(ophId, songId);

    if (data.length === 0) {
      return res.status(404).json({
        message: "No song found under review with provided OPH_ID and songId",
      });
    }

    res.status(200).json({ song: data[0] });
  } catch (error) {
    console.error("Error fetching song:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllApprovedSongs = async (req, res) => {
  try {
    const data = await songsModel.getAllApprovedSongs();
    console.log("Fetched");

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No approved songs found" });
    }

    res.status(200).json({ songs: data });
  } catch (error) {
    console.error("Error fetching approved songs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getSongApproved = async (req, res) => {
  try {
    const { ophId, songId } = req.params;
    console.log("Params:", req.params);

    if (!ophId || !songId) {
      return res
        .status(400)
        .json({ message: "OPH_ID and songId are required" });
    }

    const data = await songsModel.getSongsByOphIdApproved(ophId, songId);

    if (data.length === 0) {
      return res.status(404).json({
        message: "No song found under review with provided OPH_ID and songId",
      });
    }

    res.status(200).json({ song: data[0] });
  } catch (error) {
    console.error("Error fetching song:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateSongSectionStatus = async (req, res) => {
  try {
    const { songId, ophid, section, status, reason } = req.body;

    console.log(req.body);
    console.log("from Content");

    // Validate section (your client appears to send "Audio"/"Video")
    if (!["Audio", "Video"].includes(section)) {
      return res
        .status(400)
        .json({ error: "Invalid section. Must be 'Audio' or 'Video'." });
    }

    const table = section === "Audio" ? "audio_details" : "video_details";
    console.log(table);

    // Pass ophid only for audio
    const result = await songsModel.updateSongSectionStatus(
      table,
      status,
      reason,
      songId,
      section === "Audio" ? ophid : null,
    );

    if (section === "Audio" && status === "rejected") {
      console.log("Audio Reject Api ");
    } else if (section === "Video" && status === "rejected") {
      console.log("Video Reject Api ");
    }

    console.log(result);
    console.log("test");
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No matching record found." });
    }

    // Update the main song status using the model function directly
    try {
      console.log("Updating main song status");
      console.log(ophid, songId, reason);
      
      // Validate parameters before calling the model function
      if (!ophid || !songId) {
        console.error("Missing required parameters: ophid or songId");
        throw new Error("Missing required parameters");
      }
      
      await songsModel.updateSongStatus(parseInt(songId), ophid, (reason || "").trim() || null);
    } catch (error) {
      console.error("Error updating main song status:", error);
      // Continue with notification even if main status update fails
    }

    const data = await songsModel.getSongsByOphIdUnderReview(ophid, songId);
    const songName = data?.[0]?.audio_song_name || "your song";

    // Normalize/derive status text
    const statusLower = String(status || "").toLowerCase();
    const isAccepted = statusLower === "accepted" || statusLower === "approved";
    const isRejected = statusLower === "rejected";

    const title = isAccepted
      ? `${section} has been approved for ${songName}`
      : isRejected
        ? `${section} has been rejected for ${songName}`
        : ``;

    // Build message and (optional) link based on status
    let message;
    let link; // only set for rejected

    if (isAccepted) {
      message = `${section} for your song ${songName} was ${statusLower}.`;
      // No link when accepted/approved
    } else if (isRejected) {
      const reasonText = reason ? ` Reason: ${reason}` : "";
      message = `${section} of your song ${songName} was rejected due to ${reasonText}`;
      link = "/dashboard/upload-song"; // include link when rejected
    } else {
      message = `${section} for your song ${songName} was ${statusLower}.`;
      // No link by default for other statuses
    }

    // Prepare notification payload; include link only when present
    const notificationPayload = {
      ophid,
      message,
      title,
      ...(link ? { link } : {}),
    };

    // Save to DB
    const notification = await saveNotification(notificationPayload);

    // Emit via Socket.IO if user is online
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    if (!io || !onlineUsers) {
      console.warn("Socket IO or onlineUsers map is not initialized");
    } else {
      const userSocketId = onlineUsers.get(ophid);

      if (userSocketId) {
        io.to(userSocketId).emit("Music-update", notification);
        console.log(
          `Emitted 'Music-update' to ophid ${ophid}, socket ID: ${userSocketId}`,
        );
      } else {
        console.log(`No active socket found for ophid: ${ophid}`);
      }
    }

    res.json({ message: `Status updated for ${section}.` });
  } catch (err) {
    console.error("Error updating song status:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};


const updateSongStatus = async (req, res) => {
  try {
    const { ophid, songId, status, reason } = req.body;
    const result = await songsModel.updateSongStatus(parseInt(songId), ophid, (reason || "").trim());
    res.status(200).json({ message: "Song status updated successfully.", result });
  } catch (err) {
    console.error("Error updating song status:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

// Update audio details
const updateAudioSection = async (req, res) => {
  try {
    const { songId, ophId } = req.params;
    const audioData = req.body;
    const audioFile = req.file;

    // Validate required fields
    if (!songId || !ophId) {
      return res.status(400).json({ 
        success: false, 
        message: "songId and ophId are required" 
      });
    }

    // Validate audio data
    const requiredFields = ['Song_name', 'language', 'genre', 'primary_artist'];
    for (const field of requiredFields) {
      if (!audioData[field]) {
        return res.status(400).json({ 
          success: false, 
          message: `${field} is required` 
        });
      }
    }


    // Handle audio file upload
    let audioUrl = audioData.audio_url; // Keep existing URL if no new file uploaded
    
    // If no audio_url provided in form data, get existing one from database
    if (!audioUrl) {
      // We need to get the current audio details to preserve the existing URL
      // This will be handled by the model layer - if audioUrl is null, it won't update the field
    }
    
    if (audioFile) {
      // Validate file type
      const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/ogg'];
      if (!allowedAudioTypes.includes(audioFile.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid audio file type. Allowed types: MP3, WAV, MP4, OGG"
        });
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (audioFile.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: "Audio file too large. Maximum size: 50MB"
        });
      }

      try {
        // Upload to S3
        audioUrl = await uploadToS3(audioFile, 'audio-files');
        console.log("Audio file uploaded to S3:", audioUrl);
      } catch (uploadError) {
        console.error("S3 upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload audio file"
        });
      }
    }

    // Prepare data for database update - only include provided fields
    const updateData = {};
    
    if (audioData.Song_name !== undefined) updateData.Song_name = audioData.Song_name;
    if (audioData.language !== undefined) updateData.language = audioData.language;
    if (audioData.genre !== undefined) updateData.genre = audioData.genre;
    if (audioData.sub_genre !== undefined) updateData.sub_genre = audioData.sub_genre;
    if (audioData.mood !== undefined) updateData.mood = audioData.mood;
    if (audioData.lyrics !== undefined) updateData.lyrics = audioData.lyrics;
    if (audioData.primary_artist !== undefined) updateData.primary_artist = audioData.primary_artist;
    if (audioUrl !== undefined) updateData.audio_url = audioUrl;
    if (audioData.reject_reason !== undefined) updateData.reject_reason = audioData.reject_reason;

    console.log('Audio update data:', updateData);
    const result = await songsModel.updateAudioDetails(songId, ophId, updateData);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No audio record found for the given songId and ophId" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Audio details updated successfully", 
      data: result,
      audio_url: audioUrl
    });

  } catch (error) {
    console.error("Error updating audio details:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Update video details
const updateVideoSection = async (req, res) => {
  try {
    const { songId } = req.params;
    const videoData = req.body;
    const files = req.files;

    // Validate required fields
    if (!songId) {
      return res.status(400).json({ 
        success: false, 
        message: "songId is required" 
      });
    }

    // Validate video data
    const requiredFields = ['credits'];
    for (const field of requiredFields) {
      if (!videoData[field]) {
        return res.status(400).json({ 
          success: false, 
          message: `${field} is required` 
        });
      }
    }


    // Check current video details to validate image count
    const currentVideo = await songsModel.getVideoDetails(songId);
    if (!currentVideo) {
      return res.status(404).json({ 
        success: false, 
        message: "No video record found for the given songId" 
      });
    }

    // Handle video file upload
    let videoUrl = videoData.video_url; // Keep existing URL if no new file uploaded
    
    if (files && files.video_file && files.video_file[0]) {
      const videoFile = files.video_file[0];
      
      // Validate video file type
      const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
      if (!allowedVideoTypes.includes(videoFile.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid video file type. Allowed types: MP4, AVI, MOV, WMV, WEBM"
        });
      }

      // Validate video file size (max 500MB)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (videoFile.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: "Video file too large. Maximum size: 500MB"
        });
      }

      try {
        // Upload video to S3
        videoUrl = await uploadToS3(videoFile, 'video-files');
        console.log("Video file uploaded to S3:", videoUrl);
      } catch (uploadError) {
        console.error("S3 upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload video file"
        });
      }
    }

    // Handle thumbnail images upload
    let imageUrls = [];
    
    // First, get existing images from database to preserve them
    const existingVideoData = await songsModel.getVideoDetails(songId);
    if (existingVideoData && existingVideoData.image_url) {
      try {
        const existingImages = JSON.parse(existingVideoData.image_url);
        if (Array.isArray(existingImages)) {
          imageUrls = existingImages;
        }
      } catch (e) {
        // If not JSON, treat as single image
        imageUrls = [existingVideoData.image_url];
      }
    }

    // Add new uploaded images if provided
    if (files && files.thumbnails && files.thumbnails.length > 0) {
      // Validate image count (max 3 total)
      const totalImages = imageUrls.length + files.thumbnails.length;
      if (totalImages > 3) {
        return res.status(400).json({
          success: false,
          message: "Maximum 3 images allowed for video section"
        });
      }

      // Validate and upload each image
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxImageSize = 10 * 1024 * 1024; // 10MB per image

      for (const imageFile of files.thumbnails) {
        // Validate image type
        if (!allowedImageTypes.includes(imageFile.mimetype)) {
          return res.status(400).json({
            success: false,
            message: "Invalid image file type. Allowed types: JPEG, PNG, GIF, WEBP"
          });
        }

        // Validate image size
        if (imageFile.size > maxImageSize) {
          return res.status(400).json({
            success: false,
            message: "Image file too large. Maximum size: 10MB per image"
          });
        }

        try {
          // Upload image to S3
          const imageUrl = await uploadToS3(imageFile, 'video-thumbnails');
          imageUrls.push(imageUrl);
          console.log("Image uploaded to S3:", imageUrl);
        } catch (uploadError) {
          console.error("S3 upload error:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload image file"
          });
        }
      }
    }

    // Prepare data for database update - only include provided fields
    const updateData = {};
    
    if (videoData.credits !== undefined) updateData.credits = videoData.credits;
    if (videoUrl !== undefined) updateData.video_url = videoUrl;
    if (imageUrls !== undefined) updateData.image_url = imageUrls;
    if (videoData.reject_reason !== undefined) updateData.reject_reason = videoData.reject_reason;

    console.log('Video update data:', updateData);
    const result = await songsModel.updateVideoDetails(songId, updateData);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No video record found for the given songId" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Video details updated successfully", 
      data: result,
      video_url: videoUrl,
      image_urls: imageUrls
    });

  } catch (error) {
    console.error("Error updating video details:", error);
    
    // Handle specific error for image count validation
    if (error.message.includes('Maximum 3 images allowed')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

module.exports = {
  getAll,
  getSongsUnderReview,
  getAllApprovedSongs,
  getSongApproved,
  updateSongSectionStatus,
  updateSongStatus,
  updateAudioSection,
  updateVideoSection
};
