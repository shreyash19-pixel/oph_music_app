const contactUsModel = require("../model/contact_us");
const { Resend } = require('resend');
const { contactFormConfirmationEmail } = require('../utils/emailTemplates');

const resend = new Resend('re_XMPVxrwG_5piBuXZ9ti12ovEuQC7RVuV5');

const insertContactUs = async (req, res) => {
  const { name, email, phone, instagram_handle, description } = req.body;
  console.log(name, email, phone, instagram_handle, description);
  
  try {
    const result = await contactUsModel.insertContactUs(name, email, phone, instagram_handle, description);
    
    // Send confirmation email to user
    if (email) {
      console.log("=== CONTACT FORM SUBMISSION EMAIL PROCESS STARTED ===");
      console.log("Sending confirmation email to:", email);
      
      try {
        const emailResult = await resend.emails.send({
          from: 'OPH Community <creators@ophcommunity.org>',
          to: email,
          subject: 'Thank You for Contacting OPH Community!',
          html: contactFormConfirmationEmail(name, email, phone, instagram_handle, description)
        });
        console.log("✓✓✓ Contact form confirmation email sent successfully!");
        console.log("Email result:", JSON.stringify(emailResult, null, 2));
      } catch (emailError) {
        console.log("✗ Error sending contact form confirmation email:", emailError.message);
        // Don't fail the request if email fails
      }
      console.log("=== CONTACT FORM SUBMISSION EMAIL PROCESS ENDED ===");
    }
    
    res.status(201).json({ message: "Contact us data inserted successfully", result });
  } catch (error) {
    console.error("Error in insertContactUs:", error);
    res.status(500).json({ message: "Failed to insert contact us data", error: error.message });
  }
};

const getContactUs = async (req, res) => {
  const result = await contactUsModel.getContactUs();
  res.status(200).json({ message: "Contact us data fetched successfully", result });
};

module.exports = { insertContactUs, getContactUs };