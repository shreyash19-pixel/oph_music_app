const express = require("express");
const router = express.Router();
const contactUsCont = require("../controllers/contact_us");

router.post("/contact_us", contactUsCont.insertContactUs);
router.get("/get_contact_us", contactUsCont.getContactUs);

module.exports = router;