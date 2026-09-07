/**
 * Validate and export environment variables
 */
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`CRITICAL CONFIG ERROR: Missing environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
};
