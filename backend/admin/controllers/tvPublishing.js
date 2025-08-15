const tvModel = require("../model/tvPublishing");

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
  const { song_id, lock } = req.body;

  if (!song_id || typeof lock !== "number") {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    await tvModel.updateTvLock(song_id, lock);
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
    const audio = req.body.audio || undefined;
    const video = req.body.video || undefined;

    if (!song_id) {
      return res.status(400).json({ error: "song_id is required" });
    }

    if (!audio && !video) {
      return res
        .status(400)
        .json({ error: "At least one file (audio or video) is required" });
    }

    await tvModel.updateTvFiles(song_id, audio, video);

    return res.json({ message: "Files updated successfully" });
  } catch (err) {
    console.error("Error updating files:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  getTv,
  getAllTv,
  updateLockStatus,
  updateTvStatus,
  updateTvFiles,
};
