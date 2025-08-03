const express = require("express")
const router = express.Router()

const authMiddleware = require("../middleware/authenticate")
const {incrementTrafficCounterController} = require("../controllers/increment_traffic_counter")

router.post("/increment-traffic", authMiddleware , incrementTrafficCounterController)


module.exports = router