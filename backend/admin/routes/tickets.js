const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});
const {
  createTicket,
  getAllTickets,
  getTicketSummaries,
  updateResolvedSummary,
  getTicket,
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

router.get("/getAllTickets", getAllTickets);

router.get("/getTicketSummaries", getTicketSummaries);

router.get("/getTicket", getTicket);

module.exports = router;
