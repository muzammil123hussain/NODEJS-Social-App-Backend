const { validationResult } = require("express-validator");
const { v4 } = require("uuid");
const HttpError = require("../models/http-error");
const PlaceModel = require("../models/place");
const UserModel = require("../models/user");
const mongoose = require("mongoose");

let PLACES = [
  {
    id: "p1",
    title: "Makli Necropolis",
    description:
      "Makli Necropolis is one of the largest funerary sites in the world, spread over an area of 10 kilometres near the city of Thatta, in the Pakistani province of Sindh. The site houses approximately 500,000 to 1 million tombs built over the course of a 400-year period.",
    address: "Makli, Thatta, Sindh",
    creator: "u1",
  },
  {
    id: "p2",
    title: "KARLI",
    description:
      "Keenjhar Lake commonly called Malik Lake is located in Thatta District of Sindh the province of Pakistan. It is situated about 36 kilometres from the city of Thatta. It is the largest fresh water lake in Pakistan and an important source of drinking water for Thatta District and Karachi city.",
    address: "Thatta, Sindh",
    creator: "u2",
  },
];

const getPlaceById = async (req, res, next) => {
  const placeID = req.params.placeID;
  let place;
  try {
    place = await PlaceModel.findById(placeID);
  } catch (err) {
    return next(new HttpError("something went wrong in DB server", 500));
  }

  if (!place) {
    return next(new HttpError("No place found with this place id", 404));
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userID = req.params.userID;

  let places;
  try {
    places = await PlaceModel.find({ creator: userID });
  } catch (err) {
    return next(new HttpError("something went wrong in DB server", 500));
  }

  if (!places || places.length === 0) {
    return next(new HttpError("No place found for this user id", 404));
  }
  res.status(200).json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(new HttpError("Invalid input", 422));
  }

  const { title, description, address, creator } = req.body;

  const createdPlace = new PlaceModel({
    title,
    description,
    address,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/View_of_Makli_by_Usman_Ghani_%28cropped%29.jpg",
    creator,
  });

  let user;
  try {
    user = await UserModel.findById(creator);
  } catch (err) {
    return next(new HttpError("Something went wrong in finding user", 500));
  }

  if (!user) {
    return next(new HttpError("No user found with this ID", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(new HttpError("Invalid input", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.placeID;

  let place;
  try {
    place = await PlaceModel.findById(placeId);
  } catch (err) {
    return next(
      new HttpError(
        "something went wrong in DB server, could not update place",
        500
      )
    );
  }

  if (!place) {
    return next(new HttpError("No place found with this place id", 404));
  }

  (place.title = title), (place.description = description);

  try {
    await place.save();
  } catch (err) {
    return next(new HttpError("Place is not Updated", 500));
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.placeID;

  let place;

  try {
    place = await PlaceModel.findById(placeId);
  } catch (err) {
    return next(
      new HttpError(
        "something went wrong in DB server, could not delete place",
        500
      )
    );
  }

  if (!place) {
    return next(new HttpError("Place not found with this id", 404));
  }
  try {
    place.remove();
  } catch (err) {
    return next(new HttpError("something went wrong in DB server", 500));
  }

  res.status(200).json({ message: "Place deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
