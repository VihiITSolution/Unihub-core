const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { apiLimiter } = require("./middleware/rateLimiter");
const { corsOriginCallback } = require("./config/cors");
const errorHandler = require("./middleware/errorHandler");

const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const followRoutes = require("./routes/followRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors({
    origin: corsOriginCallback,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/social", apiLimiter);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Unihub Social Service is healthy", timestamp: new Date() });
});

app.use("/api/social/posts", postRoutes);
app.use("/api/social/comments", commentRoutes);
app.use("/api/social/follow", followRoutes);
app.use("/api/social/profile", profileRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
