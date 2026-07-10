const rateLimit = require("express-rate-limit");

const isDevelopment = process.env.NODE_ENV === "development";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 500,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter };
