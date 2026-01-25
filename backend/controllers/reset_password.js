const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user_details = require("../model/reset_password")


const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    console.log("Reset password request received");
    console.log("Token:", token ? "present" : "missing");
    console.log("New password:", new_password ? "present" : "missing");

    if (!token || !new_password) {
      console.log("Missing token or password");
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    // Verify token
    let decoded;
    try {
      console.log("Verifying token...");
      decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log("Token verified. Decoded:", decoded);
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    // Verify token type
    if (decoded.type !== "password_reset") {
      console.error("Invalid token type:", decoded.type);
      return res.status(401).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    console.log("Hashing password...");
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    console.log("Password hashed successfully");

    console.log("Updating password for user:", decoded.id);
    // Update password
    const updateResult = await user_details.updatePassword(decoded.id, hashedPassword);
    console.log("Password update result:", updateResult);

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {resetPassword}
