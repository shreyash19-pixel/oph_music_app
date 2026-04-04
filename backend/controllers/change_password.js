const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user_details = require("../model/reset_password");

const changePassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log("Decoded token:", decoded);
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Extract oph_id from token (it's stored in userData.artist.id)
    const ophId = decoded.userData?.artist?.id || decoded.id;
    
    if (!ophId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure",
      });
    }

    if (!new_password) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    console.log("Updating password for ophid:", ophId);

    // Update password using ophid from token
    await user_details.updatePassword(ophId, hashedPassword);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { changePassword };
