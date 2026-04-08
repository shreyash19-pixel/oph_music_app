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
router.get("/event-participants-excel", allDataCont.downloadEventParticipants);
router.get("/contact-us-excel", allDataCont.downloadContactUs);
router.get("/special-artist-details-excel", allDataCont.downloadSpecialArtistDetails);
router.get("/special-artist-songs-excel", allDataCont.downloadSpecialArtistSongsExcel);
router.get("/songs-register-excel", allDataCont.downloadSongsRegister);
router.get("/audio-details-excel", allDataCont.downloadAudioDetailsExcel);
router.get("/video-details-excel", allDataCont.downloadVideoDetailsExcel);

module.exports = router;
