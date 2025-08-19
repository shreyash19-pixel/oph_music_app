const express = require("express");
const router = express.Router();
const multer = require("multer");
const events = require("../controllers/events");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/events", events.fetchAllEvents);
router.post("/post-events", upload.single("image"), events.createEvent);
router.get("/events_status", events.fetchAllEventsWithStatus);
router.get("/event/:id", events.getEventById);

module.exports = router;
