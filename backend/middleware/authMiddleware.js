const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { errorResponse } = require("../utils/responseHandler");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "agriconnect_jwt_secret_key_2026");

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return errorResponse(res, "Not authorized, user not found", 401);
      }

      return next();
    } catch (error) {
      console.error("Auth Middleware JWT verification error:", error.message);
      return errorResponse(res, "Not authorized, token failed", 401);
    }
  }

  if (!token) {
    return errorResponse(res, "Not authorized, no token provided", 401);
  }
};

// Middleware to authorize specific roles (case-insensitive for robust compatibility)
const authorize = (...roles) => {
  const normalizedAllowedRoles = roles.map((r) => (r || "").toString().toLowerCase().trim());
  return (req, res, next) => {
    const userRole = (req.user && req.user.role ? req.user.role : "").toString().toLowerCase().trim();
    if (!req.user || !normalizedAllowedRoles.includes(userRole)) {
      return errorResponse(
        res,
        `User role ${req.user ? req.user.role : 'Guest'} is not authorized to access this route`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
