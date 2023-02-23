const HttpError = require("../models/http-error");

const PLACES = [
  {
    id: "p1",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/View_of_Makli_by_Usman_Ghani_%28cropped%29.jpg",
    title: "Makli Necropolis",
    description:
      "Makli Necropolis is one of the largest funerary sites in the world, spread over an area of 10 kilometres near the city of Thatta, in the Pakistani province of Sindh. The site houses approximately 500,000 to 1 million tombs built over the course of a 400-year period.",
    address: "Makli, Thatta, Sindh",
    location: {
      lat: 24.7518586,
      lang: 67.8980076,
    },
    creator: "u1",
  },
  {
    id: "p2",
    image:
      "https://stdc.gos.pk/media/com_solidres/assets/images/system/keenjharlake03.jpg",
    title: "KARLI",
    description:
      "Keenjhar Lake commonly called Malik Lake is located in Thatta District of Sindh the province of Pakistan. It is situated about 36 kilometres from the city of Thatta. It is the largest fresh water lake in Pakistan and an important source of drinking water for Thatta District and Karachi city.",
    address: "Thatta, Sindh",
    location: {
      lat: 24.9400821,
      lang: 68.0524276,
    },
    creator: "u2",
  },
];

const getPlaceById = (req, res, next) => {
  const placeID = req.params.placeID;
  const place = PLACES.find((p) => {
    return p.id === placeID;
  });

  if (!place) {
    throw (error = new HttpError("No place found with this place id", 404));
  }
  res.json({
    place,
  });
};

const getPlaceByUserId = (req, res, next) => {
  const userID = req.params.userID;
  const place = PLACES.find((p) => {
    return p.creator === userID;
  });
  if (!place) {
    return next(
      (error = new HttpError("No place found for this user id", 404))
    );
  }
  res.json({
    place,
  });
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
