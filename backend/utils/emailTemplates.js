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
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>OPH Community</title>
      <style>
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            max-width: 100% !important;
          }
          .content-padding {
            padding: 20px !important;
          }
          .header-padding {
            padding: 20px !important;
          }
          .footer-padding {
            padding: 20px !important;
          }
          .details-box-padding {
            padding: 15px !important;
          }
          .header-title {
            font-size: 18px !important;
          }
          .header-emoji {
            font-size: 24px !important;
          }
          .details-table td {
            display: block !important;
            width: 100% !important;
            padding: 8px 0 !important;
          }
          .details-table tr {
            border-bottom: 1px solid #e9ecef !important;
            display: block !important;
            padding: 8px 0 !important;
          }
          .footer-links {
            font-size: 12px !important;
            line-height: 1.8 !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td class="header-padding" style="background: linear-gradient(135deg, #684C9C 0%, #8B6BB8 100%); padding: 30px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span class="header-emoji" style="font-size: 32px;">${headerEmoji}</span>
                        <span class="header-title" style="font-size: 22px; font-weight: 600; color: #ffffff; margin-left: 10px;">${headerTitle}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td class="content-padding" style="padding: 40px;">
                  ${content}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td class="footer-padding" style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #333333;">
                    <strong style="color: #684C9C;">Best regards,</strong><br/>
                    OPH Community Team
                  </p>
                  <p class="footer-links" style="margin: 15px 0 0 0; font-size: 14px; color: #555555;">
                    <a href="mailto:connect@ophcommunity.org" style="color: #5DC9DE; text-decoration: none;">📧 connect@ophcommunity.org</a> | 
                    <a href="https://wa.me/918976592947" style="color: #5DC9DE; text-decoration: none;">📱 WhatsApp</a> | 
                    <a href="https://ophcommunity.org/contact" style="color: #5DC9DE; text-decoration: none;">🌐 Contact Us</a>
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
        <td class="details-box-padding" style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Your Submitted Details:</p>
          
          <table class="details-table" width="100%" cellpadding="8" cellspacing="0">
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
      Thank you for registering! We're excited to confirm that your event registration has been successfully approved.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Event Details</p>
          
          <table width="100%" cellpadding="8" cellspacing="0">
            ${eventName ? `<tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Event:</td><td style="color: #555555; font-size: 14px;">${eventName}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Transaction ID:</td><td style="color: #555555; font-size: 14px;">${transactionId}</td></tr>
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Status:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Approved ✓</td></tr>
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
      Excellent news! Your time calendar date has been successfully booked.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Booking Details</p>
          
          <table width="100%" cellpadding="8" cellspacing="0">
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Release Date:</td><td style="color: #555555; font-size: 14px;">${releaseDate}</td></tr>
            ${transactionId ? `<tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Transaction ID:</td><td style="color: #555555; font-size: 14px;">${transactionId}</td></tr>` : ''}
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Status:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Confirmed ✓</td></tr>
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
      Fantastic news! Your song has been successfully registered.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Song Details</p>
          
          <table width="100%" cellpadding="8" cellspacing="0">
            ${songName ? `<tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Song:</td><td style="color: #555555; font-size: 14px;">${songName}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Transaction ID:</td><td style="color: #555555; font-size: 14px;">${transactionId}</td></tr>
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Status:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Registered ✓</td></tr>
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
      Congratulations! Your special artist song has been approved.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Song Details</p>
          
          <table width="100%" cellpadding="8" cellspacing="0">
            ${songName ? `<tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Song:</td><td style="color: #555555; font-size: 14px;">${songName}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Transaction ID:</td><td style="color: #555555; font-size: 14px;">${transactionId}</td></tr>
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Status:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Approved ✓</td></tr>
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
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Status:</td><td style="color: #dc3545; font-size: 14px; font-weight: 600;">Rejected</td></tr>
            ${rejectReason ? `<tr><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px; vertical-align: top;">Reason:</td><td style="color: #555555; font-size: 14px;">${rejectReason}</td></tr>` : ''}
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

// Personal Details Approved Email
const personalDetailsApprovedEmail = (userName) => {
  console.log('\n✅ PERSONAL DETAILS APPROVED EMAIL');
  console.log('User Name:', userName);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      Great news! Your personal details have been successfully verified and approved.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td class="details-box-padding" style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Verification Status</p>
          
          <table class="details-table" width="100%" cellpadding="8" cellspacing="0">
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Step:</td><td style="color: #555555; font-size: 14px;">Personal Details</td></tr>
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Status:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Approved ✓</td></tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      You're one step closer to joining the OPH Community! Please complete the remaining steps in your dashboard.
    </p>
  `;
  
  return getEmailTemplate('Personal Details Approved!', '✅', content);
};

// Personal Details Rejected Email
const personalDetailsRejectedEmail = (userName, rejectReason) => {
  console.log('\n❌ PERSONAL DETAILS REJECTED EMAIL');
  console.log('User Name:', userName);
  console.log('Reject Reason:', rejectReason);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      Unfortunately, your personal details have been rejected and require updates.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td class="details-box-padding" style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Verification Status</p>
          
          <table class="details-table" width="100%" cellpadding="8" cellspacing="0">
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Step:</td><td style="color: #555555; font-size: 14px;">Personal Details</td></tr>
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Status:</td><td style="color: #dc3545; font-size: 14px; font-weight: 600;">Rejected</td></tr>
            ${rejectReason ? `<tr><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px; vertical-align: top;">Reason:</td><td style="color: #555555; font-size: 14px;">${rejectReason}</td></tr>` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      Please update your personal information in your dashboard and resubmit for verification.
    </p>
  `;
  
  return getEmailTemplate('Personal Details Rejected', '❌', content);
};

// Professional Details Approved Email
const professionalDetailsApprovedEmail = (userName) => {
  console.log('\n✅ PROFESSIONAL DETAILS APPROVED EMAIL');
  console.log('User Name:', userName);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      Excellent! Your professional details have been successfully verified and approved.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td class="details-box-padding" style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Verification Status</p>
          
          <table class="details-table" width="100%" cellpadding="8" cellspacing="0">
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Step:</td><td style="color: #555555; font-size: 14px;">Professional Details</td></tr>
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Status:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Approved ✓</td></tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      You're making great progress! Please complete the remaining steps in your dashboard.
    </p>
  `;
  
  return getEmailTemplate('Professional Details Approved!', '✅', content);
};

// Professional Details Rejected Email
const professionalDetailsRejectedEmail = (userName, rejectReason) => {
  console.log('\n❌ PROFESSIONAL DETAILS REJECTED EMAIL');
  console.log('User Name:', userName);
  console.log('Reject Reason:', rejectReason);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      Unfortunately, your professional details have been rejected and require updates.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td class="details-box-padding" style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Verification Status</p>
          
          <table class="details-table" width="100%" cellpadding="8" cellspacing="0">
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Step:</td><td style="color: #555555; font-size: 14px;">Professional Details</td></tr>
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Status:</td><td style="color: #dc3545; font-size: 14px; font-weight: 600;">Rejected</td></tr>
            ${rejectReason ? `<tr><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px; vertical-align: top;">Reason:</td><td style="color: #555555; font-size: 14px;">${rejectReason}</td></tr>` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      Please update your professional information in your dashboard and resubmit for verification.
    </p>
  `;
  
  return getEmailTemplate('Professional Details Rejected', '❌', content);
};

// Documentation Details Approved Email
const documentationDetailsApprovedEmail = (userName) => {
  console.log('\n✅ DOCUMENTATION DETAILS APPROVED EMAIL');
  console.log('User Name:', userName);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      Perfect! Your documentation details have been successfully verified and approved.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td class="details-box-padding" style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Verification Status</p>
          
          <table class="details-table" width="100%" cellpadding="8" cellspacing="0">
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Step:</td><td style="color: #555555; font-size: 14px;">Documentation Details</td></tr>
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Status:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Approved ✓</td></tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      Almost there! Please complete any remaining steps in your dashboard.
    </p>
  `;
  
  return getEmailTemplate('Documentation Details Approved!', '✅', content);
};

// Documentation Details Rejected Email
const documentationDetailsRejectedEmail = (userName, rejectReason) => {
  console.log('\n❌ DOCUMENTATION DETAILS REJECTED EMAIL');
  console.log('User Name:', userName);
  console.log('Reject Reason:', rejectReason);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      Unfortunately, your documentation details have been rejected and require updates.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td class="details-box-padding" style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Verification Status</p>
          
          <table class="details-table" width="100%" cellpadding="8" cellspacing="0">
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Step:</td><td style="color: #555555; font-size: 14px;">Documentation Details</td></tr>
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Status:</td><td style="color: #dc3545; font-size: 14px; font-weight: 600;">Rejected</td></tr>
            ${rejectReason ? `<tr><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px; vertical-align: top;">Reason:</td><td style="color: #555555; font-size: 14px;">${rejectReason}</td></tr>` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
      Please update your documentation in your dashboard and resubmit for verification.
    </p>
  `;
  
  return getEmailTemplate('Documentation Details Rejected', '❌', content);
};

// All Documents Verified Email
const allDocumentsVerifiedEmail = (userName) => {
  console.log('\n🎉 ALL DOCUMENTS VERIFIED EMAIL');
  console.log('User Name:', userName);
  
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">Hi ${userName || 'Artist'},</p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555; line-height: 1.6;">
      Congratulations! All your documents have been successfully verified and approved.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
      <tr>
        <td class="details-box-padding" style="padding: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">Verification Complete</p>
          
          <table class="details-table" width="100%" cellpadding="8" cellspacing="0">
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Personal Details:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Approved ✓</td></tr>
            <tr style="border-bottom: 1px solid #e9ecef;"><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Professional Details:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Approved ✓</td></tr>
            <tr><td style="font-weight: 600; color: #333333; font-size: 14px; width: 140px;">Documentation:</td><td style="color: #2DDA89; font-size: 14px; font-weight: 600;">Approved ✓</td></tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 30px 0 15px 0; font-size: 16px; font-weight: 600; color: #684C9C;">What's Next?</p>
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #5DC9DE; font-size: 18px; font-weight: bold; margin-right: 10px;">•</span>
          <span style="color: #555555; font-size: 14px;">Access all features in your dashboard</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #5DC9DE; font-size: 18px; font-weight: bold; margin-right: 10px;">•</span>
          <span style="color: #555555; font-size: 14px;">Start uploading your music and content</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #5DC9DE; font-size: 18px; font-weight: bold; margin-right: 10px;">•</span>
          <span style="color: #555555; font-size: 14px;">Participate in events and competitions</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #5DC9DE; font-size: 18px; font-weight: bold; margin-right: 10px;">•</span>
          <span style="color: #555555; font-size: 14px;">Connect with other artists in the community</span>
        </td>
      </tr>
    </table>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
      <tr>
        <td style="background-color: #e8f4f8; border-left: 4px solid #5DC9DE; padding: 15px 20px; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #684C9C; line-height: 1.6;">
            Welcome to the OPH Community! We're excited to have you on board and can't wait to see your amazing work.
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return getEmailTemplate('Congratulations! Your Documents are Verified', '🎉', content);
};

// 📧 Forgot Password Email Template
function forgotPasswordEmail(userName, resetLink) {
  console.log('📧 Generating forgot password email template');
  
  const content = `
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${userName},</p>
    
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Forgot your password? No worries—it happens to the best of us! Just click the button below to set a new one and get back into your account:</p>
    
    <table cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
      <tr>
        <td style="background: linear-gradient(135deg, #684C9C 0%, #8B6BB8 100%); border-radius: 8px; text-align: center;">
          <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">Reset Password</a>
        </td>
      </tr>
    </table>
    
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">If you didn't request this, feel free to ignore this email—your account is safe.</p>
    
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">⏰ This link will expire in 5 minutes, so be sure to reset it soon. Need help? We're happy to assist—just reach out!</p>
  `;
  
  return getEmailTemplate('Reset Your Password', '🔐', content);
}

// 📧 Password Reset Success Email Template
function passwordResetSuccessEmail(userName) {
  console.log('📧 Generating password reset success email template');
  
  const content = `
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${userName},</p>
    
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Your password has been successfully reset! 🎉</p>
    
    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="width: 140px; color: #666; font-size: 14px; vertical-align: top;">Status:</td>
                    <td style="color: #2DDA89; font-size: 14px; font-weight: 600;">✅ Password Changed Successfully</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="width: 140px; color: #666; font-size: 14px; vertical-align: top;">Security Note:</td>
                    <td style="color: #333; font-size: 14px;">You can now log in with your new password</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">🔒 If you didn't make this change, please contact us immediately to secure your account.</p>
  `;
  
  return getEmailTemplate('Password Reset Successful', '✅', content);
}

module.exports = {
  contactFormConfirmationEmail,
  eventBookingApprovedEmail,
  dateBookingApprovedEmail,
  songRegistrationApprovedEmail,
  specialArtistSongApprovedEmail,
  paymentApprovedEmail,
  paymentRejectedEmail,
  personalDetailsApprovedEmail,
  personalDetailsRejectedEmail,
  professionalDetailsApprovedEmail,
  professionalDetailsRejectedEmail,
  documentationDetailsApprovedEmail,
  documentationDetailsRejectedEmail,
  allDocumentsVerifiedEmail,
  forgotPasswordEmail,
  passwordResetSuccessEmail
};
