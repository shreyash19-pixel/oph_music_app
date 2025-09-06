const express = require("express");
const router = express.Router();
const multer = require("multer");
const events = require("../controllers/events");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/events", events.fetchAllEvents);
router.post("/post-events", upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'payment_qr', maxCount: 1 },
  { name: 'payment_qr_discount', maxCount: 1 }
]), events.createEvent);
router.get("/events_status", events.fetchAllEventsWithStatus);
router.get("/event/:id", events.getEventById);
router.get("/event_management/:event_id", events.getEventById);
router.put("/update-event/:id", upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'payment_qr', maxCount: 1 },
  { name: 'payment_qr_discount', maxCount: 1 }
]), events.updateEvent);

module.exports = router;
