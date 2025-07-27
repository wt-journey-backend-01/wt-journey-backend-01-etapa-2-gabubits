class APIError extends Error {
  constructor(status, message, errors) {
    super(status, message, errors);

    this.status = status;
    this.message = message;
    this.errors = errors;
  }
}

export class InvalidIdError extends APIError {
  constructor(errors) {
    super(404, "ID inválido", errors);
  }
}

export class IdNotFoundError extends APIError {
  constructor(errors) {
    super(404, "ID inexistente", errors);
  }
}

export class InvalidFormatError extends APIError {
  constructor(errors) {
    super(400, "Atributos inválidos", errors);
  }
}

export class InvalidQueryError extends APIError {
  constructor(errors) {
    super(400, "Query inválida", errors);
  }
}

export class NotFoundRouteError extends APIError {
  constructor(errors) {
    super(404, "Endpoint inexistente", errors);
  }
}

export function errorHandler(err, req, res, next) {
  const { status, message, errors } = err;
  res.status(status).send({ status, message, errors });
}
