class HttpError extends Error {
  constructor(message, erroCode) {
    super(message);
    this.code = erroCode;
  }
}

module.exports = HttpError;
