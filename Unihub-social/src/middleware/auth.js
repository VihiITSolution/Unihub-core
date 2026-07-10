const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Mirrors Unihub-backend/src/middleware/auth.js's verifyJwtAndLoadUser
// exactly (same JWT_SECRET, same HS256 alg, same isActive check) so a token
// issued by Unihub-backend's login is accepted here with no network call.
const verifyJwtAndLoadUser = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ["HS256"],
  });
  const user = await User.findByPk(decoded.id);

  if (!user || !user.isActive) {
    throw new Error("Invalid token or user inactive.");
  }

  return user;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    req.user = await verifyJwtAndLoadUser(token);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next();

    req.user = await verifyJwtAndLoadUser(token);
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authMiddleware, optionalAuthMiddleware, verifyJwtAndLoadUser };
