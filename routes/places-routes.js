const express = require("express");
const bodyParser = require("body-parser");
const { getPlaceById, getPlaceByUserId, createPlace } = require("../controllers/places-controller");

const router = express.Router();

router.get("/:placeID", getPlaceById);

router.get("/user/:userID", getPlaceByUserId);

router.post("/", createPlace);

module.exports = router;
