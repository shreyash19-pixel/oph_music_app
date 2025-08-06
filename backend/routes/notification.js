// routes/notifications.js
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification");

router.get(
  "/notification/:ophid",
  notificationController.getNotificationsByOphid,
);

router.put(
  "/notification/:id/read",
  notificationController.markNotificationAsRead,
);

module.exports = router;
