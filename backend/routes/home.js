const express = require("express")

const router = express.Router()
const authMiddleware = require("../middleware/authenticate")
const {newReleasesController} = require("../controllers/home")

router.get("/home/new-releases",authMiddleware, newReleasesController)

module.exports = router
