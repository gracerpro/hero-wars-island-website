export default class HttpError extends Error {
  constructor(statusCode, message) {
    message = message ? message : "HTTP status = " + statusCode + ".";
    super(message);

    this.statusCode = statusCode;
    this.message = message;
  }
}
