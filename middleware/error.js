const ErrorHandler = require("./../utils/errorhandler");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ErrorHandler(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${value}. Please use another ${field}.`;
  return new ErrorHandler(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new ErrorHandler(message, 400);
};

const handleJWTError = () =>
  new ErrorHandler("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new ErrorHandler("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  error.message = err.message;

  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

  sendErrorDev(error, req, res);
};

// const ErrorHandler = require("../utils/errorhandler");

// module.exports = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.message = err.message || "Internal Server Error";

//   //Wrong Mongodb Id error
//   if (err.name === "CastError") {
//     const message = `Resource not found. Invalid: ${err.path}`;
//     err = new ErrorHandler(message, 400);
//   }
//   res.status(err.statusCode).json({
//     success: false,
//     status: err.statusCode,
//     message: err.message,
//   });
// };
