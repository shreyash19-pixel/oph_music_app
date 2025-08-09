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
    const validStatuses = ["Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status value. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    // If status is Rejected, reason is required
    if (status === "Rejected" && (!reason || reason.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "Reason is required when rejecting content",
      });
    }

    // If status is Approved, reason can be empty
    const reasonToSave = status === "Rejected" ? reason.trim() : "";

    const result = await tvModel.updateTvStatus(song_id, status, reasonToSave);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: `Content ${status.toLowerCase()} successfully`,
      });
    }

    return res.status(404).json({
      success: false,
      message: "Content with given song_id not found",
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

module.exports = { 
  getTv,
  getAllTv,
  updateLockStatus,
  updateTvStatus,
};
