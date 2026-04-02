const {
  incrementTrafficCounter,
} = require("../model/increment_traffic_counter");

const incrementTrafficCounterController = async (req, res) => {
  try {
    const { ophid, traffic_counter } = req.body;
    const delta = Number(traffic_counter);
    if (!ophid || !Number.isFinite(delta) || delta === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required field",
      });
    }

    const response = await incrementTrafficCounter(ophid, delta);

    if (response.affectedRows > 0) {
      return res.status(201).json({
        success: true,
        message: "Data updated successfully",
      });
    }

    return res.status(404).json({
      success: false,
      message: "Artist not found",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {incrementTrafficCounterController}