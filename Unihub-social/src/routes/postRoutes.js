const express = require("express");
const router = express.Router();
const { authMiddleware, optionalAuthMiddleware } = require("../middleware/auth");
const { uploadPostMedia } = require("../config/upload");
const {
  createPost,
  getFeed,
  getUserWall,
  getPost,
  deletePost,
  likePost,
  unlikePost,
  listComments,
  addComment,
  deleteComment,
} = require("../controllers/postController");

router.post("/", authMiddleware, uploadPostMedia, createPost);
router.get("/feed", authMiddleware, getFeed);
router.get("/user/:userId", optionalAuthMiddleware, getUserWall);
router.get("/:postId", optionalAuthMiddleware, getPost);
router.delete("/:postId", authMiddleware, deletePost);

router.post("/:postId/like", authMiddleware, likePost);
router.delete("/:postId/like", authMiddleware, unlikePost);

router.get("/:postId/comments", optionalAuthMiddleware, listComments);
router.post("/:postId/comments", authMiddleware, addComment);

module.exports = router;
