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

module.exports = {
  getTv,
  getAllTv,
};
