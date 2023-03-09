const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const UserModel = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await UserModel.find({}, "-password");
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!users) {
    return next(new HttpError("No user found", 404));
  }

  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(new HttpError("Invalid input", 422));
  }

  const { name, email, password } = req.body;
  const hasUser = await UserModel.findOne({ email: email });
  if (hasUser) {
    return next(new HttpError("User Already Exist", 422));
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Cannot create user, Try again", 500));
  }
  const createdUser = new UserModel({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("User is not created", 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "secretTokenJWT",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("User is not created", 500));
  }
  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await UserModel.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("something went wrong", 422));
  }
  if (!user) {
    return next(new HttpError("Cannot find user with this email", 404));
  }

  let isValidCreds = false;

  try {
    isValidCreds = await bcrypt.compare(password, user.password);
  } catch (err) {
    return next(new HttpError("Error in Log In, Try again", 500));
  }

  if (!isValidCreds) {
    return next(new HttpError("Invalid creds", 401));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      "secretTokenJWT",
      { expiresIn: "1h" }
      );
  } catch (err) {
    return next(new HttpError("Log in Error ", 500));
  }

  res.status(200).json({
    message: "Logged In",
    userId: user.id,
    email: user.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
