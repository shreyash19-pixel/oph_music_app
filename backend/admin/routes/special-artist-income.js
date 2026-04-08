const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authenticate");
const forbidSalesMemberApprovals = require("../../middleware/forbidSalesMemberApprovals");
const forbidAccountsMemberIncomeApproval = require("../../middleware/forbidAccountsMemberIncomeApproval");
const {
  checkSpecialArtistIncomeStatusCont,
  setSpecialArtistIncomeStatusCont,
  getSpecialArtistIncomeCont,
  getIndividualSpecialArtistIncomeCont,
} = require("../controllers/special-artist-income");

router.get(
  "/get-special-artists-income-status",
  checkSpecialArtistIncomeStatusCont,
);

router.get("/get-special-artists-income", getSpecialArtistIncomeCont);
router.get(
  "/get-individual-special-artists-income",
  getIndividualSpecialArtistIncomeCont,
);

router.post(
  "/set-special-artists-income-status",
  authMiddleware,
  forbidAccountsMemberIncomeApproval,
  forbidSalesMemberApprovals,
  setSpecialArtistIncomeStatusCont
);

module.exports = router;
