const tvModel = require("../model/tvPublishing");
const { saveNotification } = require("../../utils/notify");

const { uploadToS3 } = require("../../utils");

const getTv = async (req, res) => {
  const { song_id } = req.query;
  if (!song_id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing song_id in query" });
  } else {
    try {
      const tv = await tvModel.getTv(song_id);
      res.status(200).json({ success: true, data: tv });
      console.log("req.query:", tv);
      console.log("Controller - song_id:", song_id);
    } catch (error) {
      console.error("Error fetching tv based on song_id:", error);
      console.log("Controller - song_id:", song_id);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};

const getAllTv = async (req, res) => {
    try {
      const tv = await tvModel.getAllTv();
      res.status(200).json({ success: true, data: tv });
      console.log("req.query:", tv);
    } catch (error) {
      console.log("Error fetching All data",error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
}
  

const updateLockStatus = async (req, res) => {
  const { song_id, lock, status } = req.body;

  if (!song_id || typeof lock !== "number") {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    await tvModel.updateTvLock(song_id, lock, status);
    
    // Get OPH_ID for notification
    const ophid = await tvModel.getOphIdFromSongId(song_id);
    
    if (ophid) {
      // Create and save notification
      const lockStatus = lock === 1 ? "unlocked" : "locked";
      const notificationPayload = {
        ophid,
        title: `TV Publishing ${lockStatus.charAt(0).toUpperCase() + lockStatus.slice(1)}`,
        message: `Your TV publishing content has been ${lockStatus} by admin.`,
        link: `/dashboard/tv-publishing`
      };

      // Save notification to database
      const notification = await saveNotification(notificationPayload);

      // Emit notification via Socket.IO if user is online
      const io = req.app.get("io");
      const onlineUsers = req.app.get("onlineUsers");

      if (io && onlineUsers) {
        const userSocketId = onlineUsers.get(ophid);
        if (userSocketId) {
          io.to(userSocketId).emit("TV-update", notification);
          console.log(`Emitted 'TV-update' to ophid ${ophid}, socket ID: ${userSocketId}`);
        } else {
          console.log(`No active socket found for ophid: ${ophid}`);
        }
      } else {
        console.warn("Socket IO or onlineUsers map is not initialized");
      }
    }
    
    return res.json({ success: true, message: "Lock status updated" });
  } catch (err) {
    console.error("Error updating lock:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const updateTvStatus = async (req, res) => {
  try {
    const { song_id, status, reason } = req.body;

    // Validate required fields
    if (!song_id || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: song_id or status",
      });
    }

    // Validate status values
    const finalStatus = status === "Accepted" ? "Accepted" : "rejected";
    const finalReason =
      status === "Rejected" ? reason || "No reason provided" : null;
    const rejectedStep = status === "Rejected" ? "ContentFiles" : null;

     if (status === "Rejected" && !reason) {
       return res.status(400).json({
         success: false,
         message: "Reason is required when rejecting.",
       });
     }

     const result = await tvModel.updateTvStatus(
       song_id,
       finalStatus,
       finalReason,
       rejectedStep
     );

     if (result.affectedRows > 0) {
       // Get OPH_ID for notification
       const ophid = await tvModel.getOphIdFromSongId(song_id);
       
       if (ophid) {
         // Create and save notification
         const notificationPayload = {
           ophid,
           title: `TV Publishing ${finalStatus}`,
           message: finalStatus === "Accepted" 
             ? "Your TV publishing content has been accepted by admin."
             : `Your TV publishing content has been rejected. Reason: ${finalReason}`,
           link: `/dashboard/tv-publishing`
         };

         // Save notification to database
         const notification = await saveNotification(notificationPayload);

         // Emit notification via Socket.IO if user is online
         const io = req.app.get("io");
         const onlineUsers = req.app.get("onlineUsers");

         if (io && onlineUsers) {
           const userSocketId = onlineUsers.get(ophid);
           if (userSocketId) {
             io.to(userSocketId).emit("TV-update", notification);
             console.log(`Emitted 'TV-update' to ophid ${ophid}, socket ID: ${userSocketId}`);
           } else {
             console.log(`No active socket found for ophid: ${ophid}`);
           }
         } else {
           console.warn("Socket IO or onlineUsers map is not initialized");
         }
       }
       
       return res.status(200).json({
         success: true,
         message: `TV status updated to ${finalStatus}`,
       });
     }

     res.status(404).json({
       success: false,
       message: "Song not found",
     });

  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


const updateTvFiles = async (req, res) => {
  try {
    const { song_id } = req.body;
    const audio_file = req.files?.audio_url?.[0];
    const video_file = req.files?.video_url?.[0];

    if (!song_id) {
      return res
        .status(400)
        .json({ success: false, message: "song_id is required" });
    }

    let updates = {};

    if (audio_file) {
      const audio_url = await uploadToS3(
        audio_file,
        `contents/${song_id}/audio_url`
      );
      updates.audio_url = audio_url;
    }

    if (video_file) {
      const video_url = await uploadToS3(
        video_file,
        `contents/${song_id}/video_url`
      );
      updates.video_url = video_url;
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    await tvModel.updateTvFiles(song_id, updates);

    res.json({ success: true, message: "Files updated successfully" });
  } catch (err) {
    console.error("Error updating files:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};





module.exports = {
  getTv,
  getAllTv,
  updateLockStatus,
  updateTvStatus,
  updateTvFiles,
};
