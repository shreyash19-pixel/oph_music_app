const express = require("express")
const router = express.Router()
const {signin, getArtistDetail} = require("../controllers/signin")

router.route("/auth/signin").post(signin)

router.route("/auth/get-artist-detail/:ophid").get(getArtistDetail)


module.exports = router