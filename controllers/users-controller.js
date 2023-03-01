const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const UserModel = require("../models/user");

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
  const createdUser = new UserModel({
    name,
    email,
    password,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/View_of_Makli_by_Usman_Ghani_%28cropped%29.jpg",
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("User is not created", 500));
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
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
  if (user.password !== password) {
    return next(new HttpError("Invalid creds", 401));
  }
  res
    .status(200)
    .json({
      message: "Logged In",
      user: user.toObject({ getters: true }),
    });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
