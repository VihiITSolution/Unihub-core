const express = require("express");
const router = express.Router();
const { authMiddleware, optionalAuthMiddleware } = require("../middleware/auth");
const { uploadAvatar: uploadAvatarMiddleware } = require("../config/upload");
const { uploadAvatar, getPublicProfile } = require("../controllers/profileController");

router.put("/picture", authMiddleware, uploadAvatarMiddleware, uploadAvatar);
router.get("/:userId", optionalAuthMiddleware, getPublicProfile);

module.exports = router;
