const jwt = require("jsonwebtoken");
const { Resend } = require('resend');
const user_details = require('../model/forgot_password');
const { forgotPasswordEmail } = require('../utils/emailTemplates');

const resend = new Resend('re_XMPVxrwG_5piBuXZ9ti12ovEuQC7RVuV5');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const artist = await user_details.checkExistingEmail(email)

    if (artist.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const artistData = artist[0];

    console.log("Artist data:", artistData);

    // Generate reset token (valid for 5 mins as per your mail)
    const resetToken = jwt.sign(
      {
        id: artistData.oph_id,
        email: artistData.email,
        type: "password_reset",
      },
      process.env.SECRET_KEY,
      { expiresIn: "5m" } // Matches the email message
    );

    // Generate reset link
    const resetLink = `https://ophcommunity.in/auth/reset-password?token=${resetToken}`;

    console.log("Sending email to:", artistData.email);

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: 'OPH Community <creators@ophcommunity.org>',
      to: artistData.email,
      subject: 'Reset Your Password – Lets Get You Back In!',
      html: forgotPasswordEmail(artistData.name || artistData.full_name || "Artist", resetLink),
    });

    console.log("Email sent successfully:", emailResult);

    res.json({
      success: true,
      message: "Password reset instructions sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {forgotPassword}
