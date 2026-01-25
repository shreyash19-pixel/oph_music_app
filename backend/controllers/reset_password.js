const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user_details = require("../model/reset_password")


const resetPassword = async (req, res) => {
  try {
    const { ophid,token ,new_password } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    // Verify token type
    if (decoded.type !== "password_reset") {
      return res.status(401).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password
    await user_details.updatePassword(ophid, hashedPassword)

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {resetPassword}