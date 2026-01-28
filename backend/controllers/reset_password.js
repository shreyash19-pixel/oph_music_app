const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user_details = require("../model/reset_password")
const { Resend } = require('resend');

const resend = new Resend('re_XMPVxrwG_5piBuXZ9ti12ovEuQC7RVuV5');


const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    console.log("Request body:", req.body);

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log("Decoded token:", decoded);
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

    if (!new_password) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    console.log("Updating password for ophid:", decoded.id);

    // Update password using ophid from token
    await user_details.updatePassword(decoded.id, hashedPassword)

    // Send confirmation email
    await resend.emails.send({
      from: 'OPH Community <creators@ophcommunity.org>',
      to: decoded.email,
      subject: 'Password Reset Successful',
      html: `
        <p>Hi,</p>
        <p>Your password has been successfully reset.</p>
        <p>If you didn't make this change, please contact us immediately at <a href="mailto:connect@ophcommunity.org">connect@ophcommunity.org</a></p>
        <br/>
        <p>Best regards,<br/>
        OPH Community Team</p>`
    });

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