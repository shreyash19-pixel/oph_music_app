const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sns");
const { Resend } = require('resend');
const user_details = require('../model/forgot_password')

const resend = new Resend('re_XMPVxrwG_5piBuXZ9ti12ovEuQC7RVuV5'); // Replace with your Resend API key

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

    // Generate reset token (valid for 5 mins as per your mail)
    const resetToken = jwt.sign(
      {
        id: artist.ophid,
        email: artist.email,
        type: "password_reset",
      },
      process.env.SECRET_KEY,
      { expiresIn: "5m" } // Matches the email message
    );

    // Generate reset link
    const resetLink = `http://localhost:5000//auth/reset-password?token=${resetToken}`;
    const htmlContent = `
      <p>Hi ${artist.name || artist.full_name || "Artist"},</p>
      <p>Forgot your password? No worries—it happens to the best of us! Just click the button below to set a new one and get back into your account:</p>
      <p><a href="${resetLink}" style="background:#8458B3; color:white; padding:10px 20px; border-radius:8px; text-decoration:none;">Reset Password</a></p>
      <p>If you didn’t request this, feel free to ignore this email—your account is safe.</p>
      <p>This link will expire in 5 minutes, so be sure to reset it soon. Need help? We’re happy to assist—just reach out!</p>
      <br/>
      <p>Best regards,<br/>
      OPH Community Team<br/>
      <a href="mailto:connect@ophcommunity.org">connect@ophcommunity.org</a> | 8433792947 | <a href="https://ophcommunity.com/contact/">ophcommunity.com/contact</a></p>`
    ;

    // Send email using Resend
    await resend.emails.send({
      from: 'OPH Community <creators@ophcommunity.org>',
      to: artist.email,
      subject: 'Reset Your Password – Let’s Get You Back In!',
      html: htmlContent,
    });

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