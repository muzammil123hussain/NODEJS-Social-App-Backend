const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return next(
        new HttpError("Authorization failed, Token not found or invalid", 401)
      );
    }
    const decodeToken = jwt.verify(token, "secretTokenJWT");
    req.userData = { userId: decodeToken.userId };
    next();
  } catch (err) {
    return next(new HttpError("Authorization failed, Token not found", 401));
  }
};
