const jwt = require("jsonwebtoken");
const { sendEmail } = require("../emailService");
const user_details = require('../model/forgot_password')

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

    // Generate reset token (valid for 5 mins)
    const resetToken = jwt.sign(
      {
        id: artist[0].ophid,
        email: artist[0].email,
        type: "password_reset",
      },
      process.env.SECRET_KEY,
      { expiresIn: "5m" }
    );

    // Generate reset link
    const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;
    const htmlContent = `
      <p>Hi ${artist[0].name || artist[0].full_name || "Artist"},</p>
      <p>Forgot your password? No worries—it happens to the best of us! Just click the button below to set a new one and get back into your account:</p>
      <p><a href="${resetLink}" style="background:#8458B3; color:white; padding:10px 20px; border-radius:8px; text-decoration:none;">Reset Password</a></p>
      <p>If you didn't request this, feel free to ignore this email—your account is safe.</p>
      <p>This link will expire in 5 minutes, so be sure to reset it soon. Need help? We're happy to assist—just reach out!</p>
      <br/>
      <p>Best regards,<br/>
      OPH Community Team<br/>
      <a href="mailto:connect@ophcommunity.org">connect@ophcommunity.org</a> | 8433792947 | <a href="https://ophcommunity.com/contact/">ophcommunity.com/contact</a></p>`;

    // Send email using emailService
    await sendEmail(artist[0].email, 'Reset Your Password – Let\'s Get You Back In!', htmlContent);

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
