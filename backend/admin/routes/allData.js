const express = require("express");
const router = express.Router();
const allDataCont = require('../controllers/allData');



router.get("/application-status", allDataCont.downloadApplicationStatus);
router.get("/user-details", allDataCont.downloadUserDetails);
router.get("/professional-details", allDataCont.downloadProfessionalDetails);
router.get("/documentation-details", allDataCont.getDocumentationDetails);
router.get("/All-payments", allDataCont.getSignUpPayments);
router.get("/bookings-excel", allDataCont.getbookingsDetails);
router.get("/song-registration-details", allDataCont.getSongApplicationStatus);
router.get("/tv-publishing-excel", allDataCont.getTvPublishing);
router.get("/withdrawals-excel", allDataCont.getWithdrawals);
router.get("/tickets-excel", allDataCont.getTickets);


module.exports = router;
