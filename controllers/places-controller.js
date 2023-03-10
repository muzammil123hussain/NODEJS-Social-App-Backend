const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const PlaceModel = require("../models/place");
const UserModel = require("../models/user");
const mongoose = require("mongoose");
const fs = require("fs");

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
  const userId = req.params.userID;

  let userWithPlaces;
  try {
    userWithPlaces = await UserModel.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(new HttpError("Invalid input", 422));
  }

  const { title, description, address } = req.body;

  const createdPlace = new PlaceModel({
    title,
    description,
    address,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await UserModel.findById(req.userData.userId);
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

  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError("you are not allowed to update place", 401));
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
    place = await PlaceModel.findById(placeId).populate("creator");
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

  if (place.creator.id.toString() !== req.userData.userId) {
    return next(new HttpError("you are not allowed to delete place", 401));
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("something went wrong in DB server", 500));
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Place deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
