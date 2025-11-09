const ticketModel = require("../model/ticket");
const { uploadToS3 } = require("../../utils");
const { saveNotification } = require("../../utils/notify");

//
// ─── CREATE TICKET ───────────────────────────────────────────────────────────────
//
const createTicket = async (req, res) => {
  try {
    const { ophID, name, email, subject, description, category, ticketNumber } =
      req.body;

    // ✅ Validate all required fields
    if (
      !ophID ||
      !name ||
      !email ||
      !subject ||
      !description ||
      !category ||
      !ticketNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ Normalize file input (support single or multiple uploads)
    let photoFiles = req.files?.attachment || [];
    if (!Array.isArray(photoFiles)) {
      photoFiles = photoFiles ? [photoFiles] : [];
    }

    // ✅ Upload all attachments in parallel (faster + safer)
    const uploadedPhotoURLs = await Promise.all(
      photoFiles.map(async (file) => {
        try {
          const url = await uploadToS3(file, `tickets/${ophID}/attachments`);
          return url;
        } catch (err) {
          console.error(`Failed to upload ${file.originalname}:`, err);
          return null; // mark failed uploads as null
        }
      })
    );

    // ✅ Keep only valid URLs
    const validURLs = uploadedPhotoURLs.filter(
      (u) => typeof u === "string" && u.startsWith("http")
    );

    // ✅ Stringify safely before inserting into DB
    const safePhotoJSON = JSON.stringify(validURLs);

    // ✅ Save ticket to DB
    const result = await ticketModel.createTicket(
      ophID,
      name,
      email,
      subject,
      description,
      category,
      ticketNumber,
      safePhotoJSON
    );

    res.status(201).json({
      success: true,
      message: "Ticket submitted successfully",
      ticket: result,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//
// ─── GET ALL TICKETS ─────────────────────────────────────────────────────────────
//
const getAllTickets = async (req, res) => {
  const { ophID } = req.query;

  if (!ophID) {
    return res
      .status(400)
      .json({ success: false, message: "Missing OPH ID in query" });
  }

  try {
    const tickets = await ticketModel.getAllTickets(ophID);
    res.status(200).json({ success: true, data: tickets });
    console.log("Fetched tickets for:", ophID);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//
// ─── UPDATE RESOLVED SUMMARY ─────────────────────────────────────────────────────
//
const updateResolvedSummary = async (req, res) => {
  const { ticketNumber, notes, ophID } = req.body;

  if (!ticketNumber || !notes || !ophID) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const summary = await ticketModel.updateResolvedSummary(
      ticketNumber,
      notes
    );

    // ✅ Save notification to DB
    const notificationMessage = `Ticket #${ticketNumber} was updated with a resolution.`;
    await saveNotification({
      ophid: ophID,
      message: notificationMessage,
      title: "Ticket Updated",
      link: `/dashboard/request-ticket`,
    });

    // ✅ Emit socket event if user is online
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    if (io && onlineUsers) {
      const userSocketId = onlineUsers.get(ophID);
      if (userSocketId) {
        io.to(userSocketId).emit("ticket-updated", {
          ticketNumber,
          message: notificationMessage,
          notes,
        });
      }
    } else {
      console.warn("Socket IO or onlineUsers map is not initialized");
    }

    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error("Error updating ticket:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

//
// ─── GET TICKET SUMMARIES ────────────────────────────────────────────────────────
//
const getTicketSummaries = async (req, res) => {
  try {
    const tickets = await ticketModel.getTicketSummaries();
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//
// ─── GET SINGLE TICKET BY NUMBER ────────────────────────────────────────────────
//
const getTicket = async (req, res) => {
  const { ticketNumber } = req.query;

  if (!ticketNumber) {
    return res
      .status(400)
      .json({ success: false, message: "Missing ticketNumber in query" });
  }

  try {
    const ticket = await ticketModel.getTicket(ticketNumber);
    res.status(200).json({ success: true, data: ticket });
    console.log("Fetched ticket:", ticketNumber);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//
// ─── EXPORT MODULE ──────────────────────────────────────────────────────────────
//
module.exports = {
  createTicket,
  getAllTickets,
  getTicketSummaries,
  updateResolvedSummary,
  getTicket,
};
