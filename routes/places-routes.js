const express = require("express");
const bodyParser = require("body-parser");
const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
} = require("../controllers/places-controller");

const router = express.Router();

router.get("/:placeID", getPlaceById);

router.get("/user/:userID", getPlacesByUserId);

router.post("/", createPlace);

router.patch("/:placeID", updatePlace);

router.delete("/:placeID", deletePlace);

module.exports = router;
