const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authenticate");
const forbidSalesMemberApprovals = require("../../middleware/forbidSalesMemberApprovals");
const {
  getSpecialArtistRequestedDetailsController,
  getIndividualSpecialArtistDetailsController,
  setArtistDetailsController,
} = require("../controllers/special-artist-details");

router.get(
  "/get-special-artists-requested-details",
  getSpecialArtistRequestedDetailsController
);
router.get(
  "/get-individual-special-artists-details",
  getIndividualSpecialArtistDetailsController
);

router.post(
  "/set-special-artist-details-decision",
  authMiddleware,
  forbidSalesMemberApprovals,
  setArtistDetailsController
);

module.exports = router;
