const express = require("express");
const { check } = require("express-validator");

const { getUsers, signup, login } = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", getUsers);

router.post(
  "/signup",
  fileUpload.sinlge("image"),
  [
    check("name").notEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  signup
);

router.post("/login", login);

module.exports = router;
