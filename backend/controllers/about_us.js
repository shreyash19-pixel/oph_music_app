const db = require("../DB/connect");

exports.getAboutUs = async (req, res) => {
  try {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.execute(`SELECT * FROM About_Us LIMIT 1`);
      
      if (rows.length > 0) {
        return res.status(200).json({
          success: true,
          data: rows[0]
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No About Us data found"
        });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get About Us error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};
