export class HttpError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message !== "" ? message : "HTTP status = " + statusCode + ".")

    this.statusCode = statusCode;
  }
}
