import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import HttpException from "../exceptions/HttpException";

// Not Found Error Handler
const notFoundError = (req: Request, res: Response, next: NextFunction) => {
  next(
    createError(
      404,
      `The requested URL ${req.url} was not found on this server`
    )
  );
};

// Custom Error Handler
const errorHandler = (
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.status || 500).json({
    success: false,
    status: err.status || 500,
    errorMessage: err.message || "something went wrong. try again!",
  });
};

export { notFoundError, errorHandler };
