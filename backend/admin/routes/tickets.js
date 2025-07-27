const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
  createTicket,
  getAllTickets,
  getTicketSummaries,
  updateResolvedSummary,
} = require("../controllers/tickets");

router.post(
  "/sendTicket",
  upload.fields([
    { name: "attachment", maxCount: 10 }, // support multiple images
  ]),
  createTicket
);

// routes/tickets.js
router.post("/resolveTicket", updateResolvedSummary);

router.get("/getTicket", getAllTickets);

router.get("/getTicketSummaries", getTicketSummaries);

module.exports = router;
