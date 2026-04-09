const contactUsModel = require("../model/contact_us");
const { Resend } = require('resend');

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
          html: `
            <p>Hi ${name || 'there'},</p>
            <p>Thank you for reaching out to us!</p>
            <p>We have received your message and our team will get back to you within 24 hours.</p>
            <br/>
            <p><strong>Your Details:</strong></p>
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Phone: ${phone}</p>
            <p>Instagram: ${instagram_handle}</p>
            ${description ? `<p>Message: ${description}</p>` : ''}
            <br/>
            <p>Stay connected with the OPH Community!</p>
            <br/>
            <p>Best regards,<br/>
            OPH Community Team<br/>
            <a href="mailto:connect@ophcommunity.org">connect@ophcommunity.org</a> | 8433792947</p>`
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