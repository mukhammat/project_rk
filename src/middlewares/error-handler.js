import { CustomError } from "../errors/custom.error.js";

/**
 * 
 * @type import('hono').ErrorHandler
 */
export const errorHandler = async (err, c) => {
  let message = 'Ошибка сервера';
  let status = 500;

  if (err instanceof CustomError) {
    message = err.message;
    status = err.statusCode;
  }
  
  return c.json({
    message: message,
  }, status)
}