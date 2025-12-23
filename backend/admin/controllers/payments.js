const payment_details = require("../model/payments");
const { saveNotification } = require("../../utils/notify");
const { updateSongStatus } = require("../model/songs");
const { sendEmail } = require("../../emailService");
const user_details = require("../../model/signin.js");
const eventsModel = require("../model/events");

const updateStatus = async (req, res) => {
  try {
    const { ophId, transactionId, status, reject_reason, songId } = req.body;

    if (!ophId || !transactionId || !status) {
      return res
        .status(400)
        .json({ message: "ophId, transactionId, and status are required" });
    }

    // If songId is provided, update song status
    if (songId) {
      await updateSongStatus(parseInt(songId), ophId, (reject_reason || "").trim() || null);
    }

    const result = await payment_details.updateStatus(
      ophId,
      transactionId,
      status,
      reject_reason,
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found to update" });
    }

    const paymentDetails = await payment_details.getPaymentDetailsByTransactionId(transactionId);
    console.log("Payment details:", paymentDetails[0]);
    const place = paymentDetails[0].From || paymentDetails[0].from || paymentDetails[0]['From'];

    // Send email when payment is approved
    if (status === "approved" && paymentDetails && paymentDetails.length > 0) {
      try {
        console.log("Payment approved, sending confirmation email...");
        const payment = paymentDetails[0];
        
        // Get user details
        const user = await user_details.findUserByOphId(ophId);
        
        if (user && user.length > 0) {
          const userEmail = user[0].email;
          const userName = user[0].full_name || user[0].stage_name || "Artist";
          
          // Send event registration email
          if (payment.event_id && place === "Event Registeration") {
            const eventDetails = await eventsModel.getEventById(payment.event_id);
            
            if (eventDetails) {
              const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #8458B3;">🎉 Event Registration Confirmed!</h2>
                  <p>Hi ${userName},</p>
                  <p>Great news! Your registration for <strong>${eventDetails.EventName}</strong> has been confirmed and your payment has been approved.</p>
                  
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Event Details:</h3>
                    <p><strong>Event:</strong> ${eventDetails.EventName}</p>
                    <p><strong>Date & Time:</strong> ${new Date(eventDetails.dateTime).toLocaleString()}</p>
                    <p><strong>Location:</strong> ${eventDetails.location}</p>
                    <p><strong>Registration Fee:</strong> ₹${eventDetails.registrationFee_normal}</p>
                    <p><strong>Winner Reward:</strong> ${eventDetails.winnerReward}</p>
                    <p><strong>Transaction ID:</strong> ${transactionId}</p>
                  </div>
                  
                  <p><strong>What's Next?</strong></p>
                  <ul>
                    <li>Keep this email as your registration confirmation</li>
                    <li>Arrive at the venue 30 minutes before the event starts</li>
                    <li>Bring a valid ID for verification</li>
                    <li>Check your dashboard for any updates</li>
                  </ul>
                  
                  <p>We're excited to see you perform! If you have any questions, feel free to reach out to us.</p>
                  
                  <p>Best of luck!</p>
                  <br/>
                  <p>Best regards,<br/>
                  OPH Community Team<br/>
                  <a href="mailto:connect@ophcommunity.org">connect@ophcommunity.org</a> | 8433792947 | <a href="https://ophcommunity.com/contact/">ophcommunity.com/contact</a></p>
                </div>`;

              await sendEmail(
                userEmail,
                `🎉 Registration Confirmed - ${eventDetails.EventName}`,
                htmlContent
              );
              console.log("Event registration confirmation email sent successfully");
            }
          }
          // Send signup completion email
          else if (!payment.event_id && !payment.song_id && place === "Registration") {
            const htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8458B3;">🎉 Welcome to OPH Community!</h2>
                <p>Hi ${userName},</p>
                <p>Congratulations! Your registration payment has been approved and you're now officially part of the OPH Community family.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Registration Details:</h3>
                  <p><strong>OPH ID:</strong> ${ophId}</p>
                  <p><strong>Transaction ID:</strong> ${transactionId}</p>
                  <p><strong>Amount:</strong> ₹${payment.amount || 'N/A'}</p>
                  <p><strong>Status:</strong> Payment Approved</p>
                </div>
                
                <p><strong>What's Next?</strong></p>
                <ul>
                  <li>Complete your profile setup if not already done</li>
                  <li>Explore upcoming events and competitions</li>
                  <li>Connect with other artists in the community</li>
                  <li>Start uploading your music and content</li>
                </ul>
                
                <p>We're excited to have you on board! Your journey as an OPH Community artist starts now.</p>
                
                <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
                
                <p>Welcome aboard!</p>
                <br/>
                <p>Best regards,<br/>
                OPH Community Team<br/>
                <a href="mailto:connect@ophcommunity.org">connect@ophcommunity.org</a> | 8433792947 | <a href="https://ophcommunity.com/contact/">ophcommunity.com/contact</a></p>
              </div>`;

            await sendEmail(
              userEmail,
              `🎉 Welcome to OPH Community - Registration Approved!`,
              htmlContent
            );
            console.log("Signup completion email sent successfully");
          }
        }
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }
    }

    let link = null;
    if (status === "rejected") {
      switch (place) {
        case "Song Registration":
          link = "/dashboard/upload-song";
          break;
        case "Event Registeration":
          link = "/dashboard/events";
          break;
        case "Date booking":
          link = "/dashboard/time-calendar";
          break;
        case "Special artist song registration":
          link = "/dashboard/special-artist-song";
          break;
        default:
          link = null;
      }
    }

    
    const message = status === "rejected" 
      ? `Your payment with Transaction ID: ${transactionId} has been ${status} for ${place} due to ${reject_reason}.`
      : `Your payment with Transaction ID: ${transactionId} has been ${status} for ${place}.`;

    const noificationPayload = {
      ophid: ophId,
      message: message,
      title: `Payment ${status} for ${place}`,
      link: link
    };
    await saveNotification(noificationPayload);
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const userSocketId = onlineUsers.get(ophId);
    if (userSocketId) {
      io.to(userSocketId).emit("Payment-update", noificationPayload);
    }


    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllSongPayments = async (req, res) => {
  try {
    const payments = await payment_details.getPaymentDetailsForAllSong();

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No song payments under review found" });
    }

    return res.status(200).json({
      message: "Song payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching song payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllEventsPayments = async (req, res) => {
  try {
    const payments = await payment_details.getPaymentDetailsForAllEvents();

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No event payments under review found" });
    }

    return res.status(200).json({
      message: "Event payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching event payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllBookingPayments = async (req, res) => {
  try {
    const payments = await payment_details.getPaymentDetailsForAllBooking();

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No booking payments under review found" });
    }

    return res.status(200).json({
      message: "Booking payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching booking payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const getPaymentDetailsForEventsByOphId = async (req, res) => {
  try {
    const { ophid } = req.params;
    console.log("Controller received ophid:", ophid);
    console.log("req.params:", req.params);
    console.log("ophid type:", typeof ophid);
    
    if (!ophid) {
      return res.status(400).json({ message: "ophid parameter is required" });
    }
    
    const payments = await payment_details.getPaymentDetailsForEventsByOphId(ophid);
    return res.status(200).json({
      message: "Event payments fetched successfully",
      data: payments,
    });
  }
  catch (error) {
    console.error("Error fetching event payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const getPaymentDetailsForSongByOphId = async (req, res) => {
  try {
    const { ophid, songid } = req.params;
    console.log("Controller received ophid:", ophid, "songid:", songid);
    
    if (!ophid || !songid) {
      return res.status(400).json({ message: "ophid and songid parameters are required" });
    }
    
    const payments = await payment_details.getPaymentDetailsForSongByOphId(ophid, songid);
    return res.status(200).json({
      message: "Song payments fetched successfully",
      data: payments,
    });
  }
  catch (error) {
    console.error("Error fetching song payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


const updateEventPaymentSp = async (req, res) => {
  try {
    const { ophId, transactionId, status, reject_reason, eventId } = req.body;

    if (!ophId || !transactionId || !status || !eventId) {
      return res
        .status(400)
        .json({ message: "ophId, transactionId, status and eventId are required" });
    }

    const result = await payment_details.updateEventPaymentSp(
      ophId,
      transactionId,
      status,
      reject_reason,
      parseInt(eventId)
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found to update" });
    }
    else{
      // Event payment status updated
    }

    res.status(200).json({ message: "Event payment updated successfully" });
  } catch (error) {
    console.error("Error updating event payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateStatusPayment = async (req, res) => {
  try {
    const { ophId, songId, status } = req.body;

    if (!ophId || !songId || !status) {
      return res
        .status(400)
        .json({ message: "ophId, songId, and status are required" });
    }

    const result = await payment_details.updateStatusPayment(
      ophId,
      songId,
      status
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found to update" });
    }

    res.status(200).json({ 
      message: "Payment status updated successfully",
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateSongPaymentSp = async (req, res) => {
  try {
    const { ophId, transactionId, status, FormData } = req.body;

    if (!ophId || !transactionId || !status || !FormData) {
      return res
        .status(400)
        .json({ message: "ophId, transactionId, status and FormData are required" });
    }

    const result = await payment_details.updateSongPaymentSp(
      ophId,
      transactionId,
      FormData,
      status
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found to update" });
    }

    res.status(200).json({ message: "Song payment updated successfully" });
  } catch (error) {
    console.error("Error updating song payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTransactionDetailsController = async (req, res) => {
  try {
    const { release_date } = req.query;

    if (!release_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const response = await payment_details.getTransactionDetails(release_date);

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: response
      });
    }

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const setPaymentVerificationController = async (req, res) => {
  try {
    const { decision, reason, release_date, from } = req.body;

    if ((decision === "rejected" && reason === null) || decision === "" ||  !release_date || !from) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    const response = await payment_details.setPaymentVerification(decision, reason, release_date, from);

    if (response) {
      return res.status(201).json({
        success: true,
        message: "Data updated successfully"
      });
    }

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getPaymentDetailsByTransactionId = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const response = await payment_details.getPaymentDetailsByTransactionId(transactionId);
    return res.status(200).json({ message: "Payment details fetched successfully", data: response });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { 
  updateStatus, 
  getAllSongPayments,
  getAllEventsPayments, 
  getAllBookingPayments, 
  getPaymentDetailsForEventsByOphId, 
  getPaymentDetailsForSongByOphId,
  updateEventPaymentSp,
  updateSongPaymentSp,
  updateStatusPayment,
  getTransactionDetailsController,
  setPaymentVerificationController,
  getPaymentDetailsByTransactionId
};
