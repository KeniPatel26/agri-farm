/**
 * Standardized API Response Handler
 */

const successResponse = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message = "Internal Server Error", statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error && process.env.NODE_ENV !== "production" ? error : undefined,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
