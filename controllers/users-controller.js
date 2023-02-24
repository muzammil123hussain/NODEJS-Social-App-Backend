const { uuid } = require("uuidv4");
const HttpError = require("../models/http-error");

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

const signup = (req, res, next) => {
  const { name, email, password } = req.body;

  const hasUser = USERS.find((u) => u.email === email);

  if (hasUser) {
    throw new HttpError("User Already Exist", 422);
  };

  const createdUser = {
    id: uuid(),
    name,
    email,
    password,
  };

  USERS.push(createdUser);
  res.status(201).json({ user: createdUser });
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
