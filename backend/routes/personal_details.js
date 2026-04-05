const express = require('express');
const router = express.Router();
const personalDetails = require('../controllers/personal_details');
const multer = require("multer");
const authMiddleware = require("../middleware/authenticate")

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.post('/auth/personal-details', authMiddleware ,upload.single("profile_image"),personalDetails.insertPersonalDetails);
router.get('/auth/personal-details',  authMiddleware,personalDetails.mapPersonalDetails);
router.get('/auth/personal',  personalDetails.getAllPersonal);
router.put('/auth/update-profile-image', authMiddleware, upload.single("profile_image"), personalDetails.updateProfileImage);

module.exports = router;