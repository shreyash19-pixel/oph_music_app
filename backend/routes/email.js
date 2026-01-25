const express = require("express");
const { sendEmail } = require("../emailService");

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { to, subject, message } = req.body;

  try {
    const html = `<p>${message}</p>`;
    const emailResponse = await sendEmail(to, subject, html);

    res.json({
      success: true,
      message: "Email sent successfully",
      data: emailResponse,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to send email",
      details: err,
    });
  }
});

module.exports = router;
