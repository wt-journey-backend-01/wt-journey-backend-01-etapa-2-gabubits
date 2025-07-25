export class APIError extends Error {
  constructor(status, message, errors) {
    super(status, message, errors);
    this.status = status;
    this.message = message;
    this.errors = errors;
  }
}
