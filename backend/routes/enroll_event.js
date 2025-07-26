
const express = require('express');
const router = express.Router();
const enrollEvent = require('../controllers/enroll_event.js');
const authMiddleware = require("../middleware/authenticate")

router.post('/event/enroll-event', authMiddleware ,enrollEvent.insertEventEnrollments);
router.get('/event/get-event', authMiddleware ,enrollEvent.getEnrolledEvents);


module.exports = router;