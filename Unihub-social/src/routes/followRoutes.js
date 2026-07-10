const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const {
  follow,
  unfollow,
  listFollowers,
  listFollowing,
  getStatus,
} = require("../controllers/followController");

router.post("/:userId", authMiddleware, follow);
router.delete("/:userId", authMiddleware, unfollow);
router.get("/:userId/followers", listFollowers);
router.get("/:userId/following", listFollowing);
router.get("/:userId/status", authMiddleware, getStatus);

module.exports = router;
