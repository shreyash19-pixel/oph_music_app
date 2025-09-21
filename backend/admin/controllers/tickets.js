const ticketModel = require("../model/ticket");
const { uploadToS3 } = require("../../utils"); // or your own local uploader
const { saveNotification } = require("../../utils/notify");
const createTicket = async (req, res) => {
  try {
    const {
      ophID,
      name,
      email,
      subject,
      description,
      category,
      ticketNumber,
      uploadedPhotoURLs = [],
    } = req.body;
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

    const photoFiles = req.files?.attachment || [];
    console.log(photoFiles);
    // const uploadedPhotoURLs = [];

    for (const file of photoFiles) {
      const url = await uploadToS3(file, `tickets/${ophID}/attachments`);
      uploadedPhotoURLs.push(url);
    }
    
    const result = await ticketModel.createTicket(
      ophID,
      name,
      email,
      subject,
      description,
      category,
      ticketNumber,
      JSON.stringify(uploadedPhotoURLs)
    );

    res.status(201).json({
      success: true,
      message: "Ticket submitted",
      ticket: result,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const getAllTickets = async (req, res) => {
  
  const { ophID } = req.query;
  if (!ophID) {
    return res
      .status(400)
      .json({ success: false, message: "Missing OPH ID in query" });
  }
  else {
    try {
      const tickets = await ticketModel.getAllTickets(ophID);
      res.status(200).json({ success: true, data: tickets });
      console.log("req.query:", tickets);
      console.log("Controller - ophID:", ophID);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      console.log("Controller - ophID:", ophID);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
};

const updateResolvedSummary = async (req, res) => {
  const { ticketNumber, notes, ophid } = req.body;

  if (!ticketNumber || !notes || !ophid) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const summary = await ticketModel.updateResolvedSummary(ticketNumber, notes);

    // Save notification to database
    const notificationMessage = `Ticket #${ticketNumber} was updated with a resolution.`;
    await saveNotification({
      ophid,
      message: notificationMessage,
      title: "Ticket Updated",
      link: `/dashboard/request-ticket`
    });

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    
    if (io && onlineUsers) {
      const userSocketId = onlineUsers.get(ophid);  
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
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



const getTicketSummaries = async (req, res) => {
  try {
    const tickets = await ticketModel.getTicketSummaries();
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getTicket = async (req, res) => {
  const { ticketNumber } = req.query;
  if (!ticketNumber) {
    return res
      .status(400)
      .json({ success: false, message: "Missing ticketNumber in query" });
  } else {
    try {
      const tv = await ticketModel.getTicket(ticketNumber);
      res.status(200).json({ success: true, data: tv });
      console.log("req.query:", tv);
      console.log("Controller - ticketNumber:", ticketNumber);
    } catch (error) {
      console.error("Error fetching tv based on ticketNumber:", error);
      console.log("Controller - ticketNumber:", ticketNumber);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};


module.exports = {
  createTicket,
  getAllTickets,
  getTicketSummaries,
  updateResolvedSummary,
  getTicket,
};
