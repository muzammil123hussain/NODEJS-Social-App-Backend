const express = require("express");
const bodyParser = require("body-parser");
const { getPlaceById, getPlaceByUserId } = require("../controllers/places-controller");

const router = express.Router();

router.get("/:placeID", getPlaceById);

router.get("/user/:userID", getPlaceByUserId);

module.exports = router;
