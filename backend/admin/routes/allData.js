const express = require("express");
const router = express.Router();
const allDataCont = require("../controllers/allData");
const authMiddleware = require("../../middleware/authenticate");
const attachExportScope = require("../middleware/attachExportScope");

const scoped = (handler) => [authMiddleware, attachExportScope, handler];

router.get("/application-status", ...scoped(allDataCont.downloadApplicationStatus));
router.get("/user-details", ...scoped(allDataCont.downloadUserDetails));
router.get("/professional-details", ...scoped(allDataCont.downloadProfessionalDetails));
router.get("/documentation-details", ...scoped(allDataCont.getDocumentationDetails));
router.get("/All-payments", ...scoped(allDataCont.getSignUpPayments));
router.get("/bookings-excel", ...scoped(allDataCont.getbookingsDetails));
router.get("/song-registration-details", ...scoped(allDataCont.getSongApplicationStatus));
router.get("/tv-publishing-excel", ...scoped(allDataCont.getTvPublishing));
router.get("/withdrawals-excel", ...scoped(allDataCont.getWithdrawals));
router.get("/tickets-excel", ...scoped(allDataCont.getTickets));
router.get("/event-participants-excel", ...scoped(allDataCont.downloadEventParticipants));
router.get("/contact-us-excel", ...scoped(allDataCont.downloadContactUs));
router.get("/special-artist-details-excel", ...scoped(allDataCont.downloadSpecialArtistDetails));
router.get("/special-artist-songs-excel", ...scoped(allDataCont.downloadSpecialArtistSongsExcel));
router.get("/songs-register-excel", ...scoped(allDataCont.downloadSongsRegister));
router.get("/audio-details-excel", ...scoped(allDataCont.downloadAudioDetailsExcel));
router.get("/video-details-excel", ...scoped(allDataCont.downloadVideoDetailsExcel));

module.exports = router;
