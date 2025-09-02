import { CustomError } from "../errors/custom.error.js";

/**
 * 
 * @type import('hono').ErrorHandler
 */
export const errorHandler = async (err, _, res, next) => {
  let message = 'Ошибка сервера';
  let status = 500;

  if (err instanceof CustomError) {
    message = err.message;
    status = err.statusCode;
  }
  
  res.status(status).json({
    message,
  });
  return;
}