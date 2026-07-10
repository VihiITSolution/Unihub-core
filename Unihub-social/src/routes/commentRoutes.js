const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const { deleteComment } = require("../controllers/postController");

router.delete("/:commentId", authMiddleware, deleteComment);

module.exports = router;
