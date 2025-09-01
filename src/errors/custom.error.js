
export class CustomError extends Error {
  statusCode;

  constructor(message = "Ошибка запроса", statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;

    // Создание стека ошибок
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const customError = new CustomError();