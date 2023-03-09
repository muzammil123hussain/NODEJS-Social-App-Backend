const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const creds = require("./dbCreds");
const fs = require("fs");

const placesRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  throw (error = new HttpError("Could not found this route", 404));
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An Unknown error occured" });
});

mongoose
  .connect(
    "mongodb+srv://" +
      creds.userName +
      ":" +
      creds.password +
      "@cluster0.4gfliar.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => app.listen(5000))
  .catch();
