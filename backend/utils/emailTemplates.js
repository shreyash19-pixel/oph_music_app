/**
 * Email Templates for OPH Community
 * Redesigned to match reference image style
 */

const getEmailTemplate = (headerTitle, headerEmoji, content) => {
  console.log('📧 EMAIL TEMPLATE GENERATION');
  console.log('Header Title:', headerTitle);
  console.log('Header Emoji:', headerEmoji);
  console.log('Content Length:', content.length);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OPH Community</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #684C9C 0%, #8B6BB8 100%); padding: 30px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="font-size: 32px;">${headerEmoji}</span>
                        <span style="font-size: 22px; font-weight: 600; color: #ffffff; margin-left: 10px;">${headerTitle}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  ${content}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #333333;">
                    <strong style="color: #684C9C;">Best regards,</strong><br/>
                    OPH Community Team
                  </p>
                  <p style="margin: 15px 0 0 0; font-size: 14px; color: #555555;">
                    <a href="mailto:connect@ophcommunity.org" style="color: #684C9C; text-decoration: none;">connect@ophcommunity.org</a> | 
                    8433792947 | 
                    <a href="https://ophcommunity.org/contact" style="color: #684C9C; text-decoration: none;">ophcommunity.org/contact</a>
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Contact Form Confirmation Email
const contactFormConfirmationEmail = (name, email, phone, instagramHandle, description) => {
  console.log('\n🎉 CONTACT FORM EMAIL');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Phone:', phone);
  console.log('Instagram:', instagramHandle);
  console.log('Description:', description);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${name || 'there'},</p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      Thank you for reaching out to us! We've received your message and our team will get back to you within <strong>24 hours</strong>.
    </p>
    
    <!-- Details Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Your Submitted Details:</p>
          
          <table width="100%" cellpadding="8" cellspacing="0">
            <tr style="border-bottom: 1px solid #e9ecef;">
              <td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Name:</td>
              <td style="color: #555555; font-size: 14px;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e9ecef;">
              <td style="font-weight: 600; color: #333333; font-size: 14px;">Email:</td>
              <td style="color: #555555; font-size: 14px;">${email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e9ecef;">
              <td style="font-weight: 600; color: #333333; font-size: 14px;">Phone:</td>
              <td style="color: #555555; font-size: 14px;">${phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e9ecef;">
              <td style="font-weight: 600; color: #333333; font-size: 14px;">Instagram:</td>
              <td style="color: #555555; font-size: 14px;">@${instagramHandle}</td>
            </tr>
            ${description ? `
            <tr>
              <td style="font-weight: 600; color: #333333; font-size: 14px; vertical-align: top; padding-top: 12px;">Message:</td>
              <td style="color: #555555; font-size: 14px; padding-top: 12px;">${description}</td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 30px 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">What's Next?</p>
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #5DC9DE; font-size: 18px; font-weight: bold; margin-right: 10px;">•</span>
          <span style="color: #555555; font-size: 14px;">Our team will review your message and respond within 24 hours</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #5DC9DE; font-size: 18px; font-weight: bold; margin-right: 10px;">•</span>
          <span style="color: #555555; font-size: 14px;">Explore upcoming events and competitions on our platform</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #5DC9DE; font-size: 18px; font-weight: bold; margin-right: 10px;">•</span>
          <span style="color: #555555; font-size: 14px;">Connect with other artists in the community</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #5DC9DE; font-size: 18px; font-weight: bold; margin-right: 10px;">•</span>
          <span style="color: #555555; font-size: 14px;">Start uploading your music and content</span>
        </td>
      </tr>
    </table>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
      <tr>
        <td style="background-color: #e8f4f8; border-left: 4px solid #5DC9DE; padding: 15px 20px; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #684C9C; line-height: 1.6;">
            We're excited to have you on board! Your journey as an OPH Community member starts now.
          </p>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      If you have any questions or need immediate assistance, don't hesitate to reach out to our support team.
    </p>
    
    <p style="margin: 15px 0 0 0; font-size: 14px; color: #555555;">
      Welcome aboard!
    </p>
  `;
  
  return getEmailTemplate('Thank You for Contacting OPH Community!', '🎉', content);
};

// Event Booking Approved Email
const eventBookingApprovedEmail = (userName, transactionId, eventName) => {
  console.log('\n🎉 EVENT BOOKING EMAIL');
  console.log('User Name:', userName);
  console.log('Transaction ID:', transactionId);
  console.log('Event Name:', eventName);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      🎉 Great news! Your event registration has been successfully approved.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Event Details</p>
          <table width="100%" cellpadding="8" cellspacing="0">
            ${eventName ? `<tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Event:</td><td style="color: #555555; font-size: 14px;">${eventName}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px;">Transaction ID:</td><td style="color: #555555; font-size: 14px;">${transactionId}</td></tr>
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px;">Status:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Approved ✓</td></tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      You can view your event details and manage your registration in your dashboard.
    </p>
  `;
  
  return getEmailTemplate('Event Successfully Booked!', '🎉', content);
};

// Date Booking Approved Email
const dateBookingApprovedEmail = (userName, transactionId, releaseDate) => {
  console.log('\n🎉 DATE BOOKING EMAIL');
  console.log('User Name:', userName);
  console.log('Transaction ID:', transactionId);
  console.log('Release Date:', releaseDate);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      🎉 Excellent! Your time calendar date has been successfully booked.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Booking Details</p>
          <table width="100%" cellpadding="8" cellspacing="0">
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Release Date:</td><td style="color: #555555; font-size: 14px;">${releaseDate}</td></tr>
            ${transactionId ? `<tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px;">Transaction ID:</td><td style="color: #555555; font-size: 14px;">${transactionId}</td></tr>` : ''}
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px;">Status:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Confirmed ✓</td></tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      Your date is now reserved. Mark your calendar and get ready for your release!
    </p>
  `;
  
  return getEmailTemplate('Date Booking Successful!', '🎉', content);
};

// Song Registration Approved Email
const songRegistrationApprovedEmail = (userName, transactionId, songName) => {
  console.log('\n🎵 SONG REGISTRATION EMAIL');
  console.log('User Name:', userName);
  console.log('Transaction ID:', transactionId);
  console.log('Song Name:', songName);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      🎵 Fantastic news! Your song has been successfully registered.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Song Details</p>
          <table width="100%" cellpadding="8" cellspacing="0">
            ${songName ? `<tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Song:</td><td style="color: #555555; font-size: 14px;">${songName}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px;">Transaction ID:</td><td style="color: #555555; font-size: 14px;">${transactionId}</td></tr>
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px;">Status:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Registered ✓</td></tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      Keep creating amazing music! We're excited to have your work in our community.
    </p>
  `;
  
  return getEmailTemplate('Song Successfully Registered!', '🎵', content);
};

// Special Artist Song Approved Email
const specialArtistSongApprovedEmail = (userName, transactionId, songName) => {
  console.log('\n⭐ SPECIAL ARTIST SONG EMAIL');
  console.log('User Name:', userName);
  console.log('Transaction ID:', transactionId);
  console.log('Song Name:', songName);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      ⭐ Congratulations! Your special artist song has been approved.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Song Details</p>
          <table width="100%" cellpadding="8" cellspacing="0">
            ${songName ? `<tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Song:</td><td style="color: #555555; font-size: 14px;">${songName}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px;">Transaction ID:</td><td style="color: #555555; font-size: 14px;">${transactionId}</td></tr>
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px;">Status:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Approved ✓</td></tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      Thank you for being a special artist in our community!
    </p>
  `;
  
  return getEmailTemplate('Special Artist Song Approved!', '⭐', content);
};

// Payment Approved Email (Generic)
const paymentApprovedEmail = (userName, transactionId) => {
  console.log('\n✅ PAYMENT APPROVED EMAIL');
  console.log('User Name:', userName);
  console.log('Transaction ID:', transactionId);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      ✅ Great news! Your payment has been approved.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Payment Details</p>
          <table width="100%" cellpadding="8" cellspacing="0">
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Transaction ID:</td><td style="color: #555555; font-size: 14px;">${transactionId}</td></tr>
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px;">Status:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Approved ✓</td></tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      You can now access your dashboard and start using our services.
    </p>
  `;
  
  return getEmailTemplate('Payment Approved!', '✅', content);
};

// Payment Rejected Email
const paymentRejectedEmail = (userName, transactionId, rejectReason) => {
  console.log('\n❌ PAYMENT REJECTED EMAIL');
  console.log('User Name:', userName);
  console.log('Transaction ID:', transactionId);
  console.log('Reject Reason:', rejectReason);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      We regret to inform you that your payment has been rejected.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Payment Details</p>
          <table width="100%" cellpadding="8" cellspacing="0">
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Transaction ID:</td><td style="color: #555555; font-size: 14px;">${transactionId}</td></tr>
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px;">Status:</td><td style="color: #dc3545; font-size: 14px; font-weight: 600;">Rejected</td></tr>
            ${rejectReason ? `<tr><td style="font-weight: 600; color: #333333; font-size: 14px; vertical-align: top;">Reason:</td><td style="color: #555555; font-size: 14px;">${rejectReason}</td></tr>` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      If you have any questions or need assistance, please don't hesitate to contact us. We're here to help resolve any issues.
    </p>
  `;
  
  return getEmailTemplate('Payment Rejected', '❌', content);
};

module.exports = {
  eventBookingApprovedEmail,
  dateBookingApprovedEmail,
  songRegistrationApprovedEmail,
  specialArtistSongApprovedEmail,
  paymentApprovedEmail,
  paymentRejectedEmail,
  contactFormConfirmationEmail,
};
