const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "agriconnect_jwt_secret_key_2026", {
    expiresIn: "30d",
  });
};

// Formats safe user profile object for client responses
const formatUserPayload = (user, token) => {
  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile || user.mobileNumber || "",
    mobileNumber: user.mobile || user.mobileNumber || "",
    role: user.role,
    profilePhoto: user.profilePhoto || "",
    language: user.language || user.preferredLanguage || "en",
    preferredLanguage: user.language || user.preferredLanguage || "en",
    verificationStatus: user.verificationStatus || "approved",
    accountStatus: user.accountStatus || "active",
    isVerified: user.isVerified || false,
    isActive: user.isActive !== undefined ? user.isActive : true,
    location: user.location || {
      type: "Point",
      coordinates: [72.5714, 23.0225],
      address: user.address || "",
    },
    village: user.village || "",
    district: user.district || "",
    state: user.state || "",
    address: user.address || "",
    createdAt: user.createdAt,
  };
  if (token) payload.token = token;
  return payload;
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      mobile,
      mobileNumber,
      password,
      role,
      village,
      district,
      state,
      language,
      preferredLanguage,
      address,
      locationAddress,
      location,
    } = req.body;

    const userMobile = (mobile || mobileNumber || "").toString().trim();
    const userRole = (role || "farmer").toString().toLowerCase().trim();
    const userLang = (language || preferredLanguage || "en").toString().trim();
    const userAddress = (address || locationAddress || "").toString().trim();

    // Validation
    if (!name || !email || !password || !userMobile || !userRole) {
      return errorResponse(res, "Please provide name, email, mobile number, password, and role", 400);
    }

    // Disallow public registration as Admin
    if (userRole === "admin") {
      return errorResponse(res, "Administrator accounts cannot be created publicly", 403);
    }

    // Check if user exists with email or mobile
    const userExists = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { mobile: userMobile },
      ],
    });

    if (userExists) {
      if (userExists.email === email.toLowerCase().trim()) {
        return errorResponse(res, "A user with this email address already exists", 400);
      }
      return errorResponse(res, "A user with this mobile number already exists", 400);
    }

    // Build location object
    let userLocation = {
      type: "Point",
      coordinates: [72.9289, 22.5645], // Default Anand/Gujarat coords
      address: userAddress || `${village ? village + ", " : ""}${district ? district + ", " : ""}${state || ""}`.trim(),
    };

    if (location && location.coordinates && Array.isArray(location.coordinates)) {
      userLocation = {
        type: "Point",
        coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
        address: location.address || userAddress || "",
      };
    }

    // Traders and Retailers default to pending verification status, Farmers are approved
    const verificationStatus = userRole === "farmer" ? "approved" : "pending";

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: userMobile,
      password,
      role: userRole,
      village: (village || "").trim(),
      district: (district || "").trim(),
      state: (state || "").trim(),
      language: userLang,
      address: userAddress,
      location: userLocation,
      verificationStatus,
      accountStatus: "active",
      isActive: true,
      isVerified: userRole === "farmer",
    });

    if (user) {
      return successResponse(
        res,
        formatUserPayload(user, generateToken(user._id)),
        "User registered successfully",
        201
      );
    } else {
      return errorResponse(res, "Invalid user data provided", 400);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user & return token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password, mobile } = req.body;

    if ((!email && !mobile) || !password) {
      return errorResponse(res, "Please provide email/mobile and password", 400);
    }

    const searchQuery = email
      ? { email: email.toLowerCase().trim() }
      : { mobile: mobile.toString().trim() };

    // Check for user
    const user = await User.findOne(searchQuery);

    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const isMatch = user.comparePassword
      ? await user.comparePassword(password)
      : await user.matchPassword(password);

    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Check account status
    if (user.accountStatus === "blocked" || user.accountStatus === "suspended") {
      return errorResponse(
        res,
        `Your account has been ${user.accountStatus}. Please contact support for assistance.`,
        403
      );
    }

    return successResponse(
      res,
      formatUserPayload(user, generateToken(user._id)),
      "User logged in successfully"
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, formatUserPayload(user), "Profile fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.mobile !== undefined) user.mobile = req.body.mobile.trim();
    if (req.body.mobileNumber !== undefined) user.mobile = req.body.mobileNumber.trim();
    if (req.body.profilePhoto !== undefined) user.profilePhoto = req.body.profilePhoto;
    if (req.body.language !== undefined) user.language = req.body.language;
    if (req.body.preferredLanguage !== undefined) user.language = req.body.preferredLanguage;
    if (req.body.village !== undefined) user.village = req.body.village.trim();
    if (req.body.district !== undefined) user.district = req.body.district.trim();
    if (req.body.state !== undefined) user.state = req.body.state.trim();
    if (req.body.address !== undefined) user.address = req.body.address.trim();

    if (req.body.location) {
      user.location = req.body.location;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updated = await user.save();
    return successResponse(res, formatUserPayload(updated), "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Public
const logoutUser = async (req, res, next) => {
  try {
    return successResponse(res, null, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
};
