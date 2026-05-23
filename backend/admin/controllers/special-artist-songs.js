const {
  getSongsList,
  getIndividualSongDetails,
  setSongStatus,
} = require("../model/special-artist-songs");
const { Resend } = require("resend");
const {
  specialArtistSongApprovedEmail,
  paymentRejectedEmail,
} = require("../../utils/emailTemplates");

const resend = new Resend("re_XMPVxrwG_5piBuXZ9ti12ovEuQC7RVuV5");

const getSongListContollers = async (req, res) => {
  try {
    const response = await getSongsList();

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: response,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getIndividualSongDetailsController = async (req, res) => {
  try {
    const { ophid, songId } = req.query;

    if (!ophid || !songId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await getIndividualSongDetails(ophid, songId);

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: response,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const setSongStatusController = async (req, res) => {
  try {
    const { ophid, songId, type, reason } = req.body;

    if (!ophid || !songId || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Update song status in database
    const response = await setSongStatus(ophid, songId, type, reason);

    if (response) {
      // Send email for song approval/rejection
      const db = require("../../DB/connect");

      try {
        console.log("=== SPECIAL ARTIST SONG STATUS EMAIL PROCESS STARTED ===");
        console.log("OphId:", ophid);
        console.log("SongId:", songId);
        console.log("Type:", type);
        console.log("Reason:", reason);

        // Fetch user and song details
        const [userData] = await db.execute(
          `SELECT 
            ud.email,
            ud.full_name,
            ud.stage_name,
            sas.song_name,
            sas.song_type,
            sas.song_id
          FROM user_details ud
          LEFT JOIN special_artist_songs sas ON ud.oph_id = sas.oph_id
          WHERE ud.oph_id = ? AND sas.song_id = ?
          LIMIT 1`,
          [ophid, songId],
        );

        console.log("User data found:", userData.length > 0 ? "YES" : "NO");
        console.log("User and song data:", JSON.stringify(userData, null, 2));

        if (userData && userData.length > 0) {
          const userEmail = userData[0].email;
          const userName = userData[0].full_name || userData[0].stage_name;
          const songName = userData[0].song_name;
          const songType = userData[0].song_type; // 'free' or 'paid'

          console.log("✓ Email:", userEmail);
          console.log("✓ Name:", userName);
          console.log("✓ Song:", songName);
          console.log("✓ Song Type:", songType);

          if (userEmail) {
            // Send approval email for both free and paid songs
            if (type === "approved") {
              console.log("=== SONG APPROVAL EMAIL ===");
              console.log("Sending song approval email to:", userEmail);

              const emailResult = await resend.emails.send({
                from: "OPH Community <creators@ophcommunity.org>",
                to: userEmail,
                subject: "Special Artist Song Approved!",
                html: specialArtistSongApprovedEmail(userName, null, songName),
              });
              console.log("✓✓✓ Song approval email sent successfully!");
              console.log(
                "Email result:",
                JSON.stringify(emailResult, null, 2),
              );
            }

            // Send rejection email for both free and paid songs
            if (type === "rejected") {
              console.log("=== SONG REJECTION EMAIL ===");
              console.log("Sending song rejection email to:", userEmail);
              console.log("Rejection reason:", reason);

              const emailResult = await resend.emails.send({
                from: "OPH Community <creators@ophcommunity.org>",
                to: userEmail,
                subject: "Special Artist Song Rejected",
                html: paymentRejectedEmail(userName, null, reason),
              });
              console.log("✓✓✓ Song rejection email sent successfully!");
              console.log(
                "Email result:",
                JSON.stringify(emailResult, null, 2),
              );
            }
          } else {
            console.log("✗ No email found for user");
          }
        } else {
          console.log(
            "✗ No user/song data found for ophid:",
            ophid,
            "songId:",
            songId,
          );
        }
      } catch (emailError) {
        console.log("✗✗✗ Error in email sending process:", emailError.message);
        console.log("Error stack:", emailError.stack);
        // Don't fail the request if email fails, just log it
      }
      console.log("=== SPECIAL ARTIST SONG STATUS EMAIL PROCESS ENDED ===");

      return res.status(201).json({
        success: true,
        message: "Data updated successfully",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getSongListContollers,
  getIndividualSongDetailsController,
  setSongStatusController,
};
