const { uuid } = require("uuidv4");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const UserModel = require("../models/user");

const USERS = [
  {
    id: "u1",
    name: "Muzammil",
    email: "test@email.com",
    password: "test",
  },
];

const getUsers = (req, res, next) => {
  res.status(200).json({ USERS });
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
    places: 'p1'
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("User is not created", 500));
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const user = USERS.find((u) => u.email === email);
  if (!user || user.password !== password) {
    throw new HttpError("Could not find user, seems to be creds wrong", 401);
  }
  res.json({ message: "Logged In" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
