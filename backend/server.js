require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const env = require("./config/env");
const { errorHandler } = require("./middleware/errorMiddleware");
const upload = require("./middleware/uploadMiddleware");
const { protect } = require("./middleware/authMiddleware");
const { successResponse, errorResponse } = require("./utils/responseHandler");

// Connect to database
connectDB();

const app = express();

// Security Headers
app.use(helmet());

// Logging Middleware
app.use(morgan("dev"));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Increased limit for responsive interactive dashboard updates
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});
app.use("/api", limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Image Upload Endpoint
app.post("/api/v1/upload", protect, upload.single("image"), (req, res) => {
  if (!req.file) {
    return errorResponse(res, "Please upload an image file", 400);
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  return successResponse(res, { imageUrl }, "Image uploaded successfully");
});
app.post("/api/upload", protect, upload.single("image"), (req, res) => {
  if (!req.file) {
    return errorResponse(res, "Please upload an image file", 400);
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  return successResponse(res, { imageUrl }, "Image uploaded successfully");
});

// Mount Routes (with v1 API Versioning and legacy support)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/v1/auth", require("./routes/authRoutes"));

app.use("/api/farms", require("./routes/farmRoutes"));
app.use("/api/v1/farms", require("./routes/farmRoutes"));

app.use("/api/crops", require("./routes/cropRoutes"));
app.use("/api/v1/crops", require("./routes/cropRoutes"));

app.use("/api/markets", require("./routes/marketRoutes"));
app.use("/api/v1/markets", require("./routes/marketRoutes"));

app.use("/api/prices", require("./routes/priceRoutes"));
app.use("/api/v1/prices", require("./routes/priceRoutes"));

app.use("/api/price-alerts", require("./routes/priceAlertRoutes"));
app.use("/api/v1/price-alerts", require("./routes/priceAlertRoutes"));

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/v1/products", require("./routes/productRoutes"));

app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/v1/orders", require("./routes/orderRoutes"));

app.use("/api/weather", require("./routes/weatherRoutes"));
app.use("/api/v1/weather", require("./routes/weatherRoutes"));

app.use("/api/location", require("./routes/locationRoutes"));
app.use("/api/v1/location", require("./routes/locationRoutes"));

app.use("/api/advisory", require("./routes/advisoryRoutes"));
app.use("/api/v1/advisory", require("./routes/advisoryRoutes"));

app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));

app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/v1/notifications", require("./routes/notificationRoutes"));

app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/v1/complaints", require("./routes/complaintRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));

app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/v1/reviews", require("./routes/reviewRoutes"));

app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/v1/favorites", require("./routes/favoriteRoutes"));

app.use("/api/schemes", require("./routes/schemeRoutes"));
app.use("/api/v1/schemes", require("./routes/schemeRoutes"));

// Basic route for testing
app.get("/", (req, res) => {
  res.send("🌾 AgriConnect API is running in full operation...");
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🌾 AgriConnect Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});
