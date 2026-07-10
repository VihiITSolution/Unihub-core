const { Op } = require("sequelize");
const { Post, PostLike, PostComment, Follow, User } = require("../models");
const { toPublicUrl } = require("../config/upload");

const AUTHOR_ATTRIBUTES = ["id", "firstName", "lastName", "profileImage", "primaryRole"];

const paginationOf = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  return { page, limit, offset: (page - 1) * limit };
};

const paginationMeta = (count, page, limit) => ({
  total: count,
  page,
  limit,
  totalPages: Math.max(Math.ceil(count / limit), 1),
});

const isAdmin = (user) =>
  user.primaryRole === "admin" || (Array.isArray(user.roles) && user.roles.includes("admin"));

/** Annotates each post with whether the requester has liked it (posts is an array of Post instances). */
const attachLikedByMe = async (posts, requesterId) => {
  if (!requesterId || posts.length === 0) {
    return posts.map((p) => ({ ...p.toJSON(), likedByMe: false }));
  }

  const likes = await PostLike.findAll({
    where: { userId: requesterId, postId: { [Op.in]: posts.map((p) => p.id) } },
    attributes: ["postId"],
  });
  const likedIds = new Set(likes.map((l) => l.postId));

  return posts.map((p) => ({ ...p.toJSON(), likedByMe: likedIds.has(p.id) }));
};

/** Returns the set of visibilities the requester is allowed to see on targetUserId's wall. */
const visibleVisibilitiesFor = async (requesterId, targetUserId) => {
  if (requesterId && requesterId === targetUserId) return ["public", "followers"];
  if (!requesterId) return ["public"];

  const follows = await Follow.findOne({
    where: { followerId: requesterId, followingId: targetUserId },
  });
  return follows ? ["public", "followers"] : ["public"];
};

/** POST /api/social/posts */
const createPost = async (req, res, next) => {
  try {
    const body = (req.body.body || "").trim();
    const files = req.files || [];

    if (!body && files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "A post needs text or at least one image.",
      });
    }

    const media = files.map((file) => ({
      url: toPublicUrl("posts", file.filename),
      type: "image",
    }));

    const post = await Post.create({
      userId: req.user.id,
      body: body || null,
      media: media.length ? media : null,
      visibility: req.body.visibility === "followers" ? "followers" : "public",
    });

    const created = await Post.findByPk(post.id, {
      include: [{ association: "author", attributes: AUTHOR_ATTRIBUTES }],
    });

    res.status(201).json({
      success: true,
      data: { post: { ...created.toJSON(), likedByMe: false } },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/social/posts/feed - own posts + posts from followed users */
const getFeed = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginationOf(req);

    const follows = await Follow.findAll({
      where: { followerId: req.user.id },
      attributes: ["followingId"],
    });
    const authorIds = [req.user.id, ...follows.map((f) => f.followingId)];

    const { count, rows } = await Post.findAndCountAll({
      where: { userId: { [Op.in]: authorIds }, isDeleted: false },
      include: [{ association: "author", attributes: AUTHOR_ATTRIBUTES }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: {
        posts: await attachLikedByMe(rows, req.user.id),
        pagination: paginationMeta(count, page, limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/social/posts/user/:userId - a single user's wall */
const getUserWall = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.userId, 10);
    const { page, limit, offset } = paginationOf(req);
    const allowedVisibilities = await visibleVisibilitiesFor(req.user?.id, targetUserId);

    const { count, rows } = await Post.findAndCountAll({
      where: {
        userId: targetUserId,
        isDeleted: false,
        visibility: { [Op.in]: allowedVisibilities },
      },
      include: [{ association: "author", attributes: AUTHOR_ATTRIBUTES }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: {
        posts: await attachLikedByMe(rows, req.user?.id),
        pagination: paginationMeta(count, page, limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/social/posts/:postId */
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId, isDeleted: false },
      include: [{ association: "author", attributes: AUTHOR_ATTRIBUTES }],
    });
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const allowedVisibilities = await visibleVisibilitiesFor(req.user?.id, post.userId);
    if (!allowedVisibilities.includes(post.visibility)) {
      return res.status(403).json({ success: false, message: "This post isn't visible to you." });
    }

    const [annotated] = await attachLikedByMe([post], req.user?.id);
    res.json({ success: true, data: { post: annotated } });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/social/posts/:postId */
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }
    if (post.userId !== req.user.id && !isAdmin(req.user)) {
      return res.status(403).json({ success: false, message: "You can only delete your own posts." });
    }

    post.isDeleted = true;
    await post.save();

    res.json({ success: true, message: "Post deleted." });
  } catch (error) {
    next(error);
  }
};

/** POST /api/social/posts/:postId/like */
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId, isDeleted: false } });
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const [, created] = await PostLike.findOrCreate({
      where: { postId: post.id, userId: req.user.id },
    });
    if (created) {
      await post.increment("likeCount");
      await post.reload();
    }

    res.json({ success: true, data: { likeCount: post.likeCount, liked: true } });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/social/posts/:postId/like */
const unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId, isDeleted: false } });
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const deleted = await PostLike.destroy({ where: { postId: post.id, userId: req.user.id } });
    if (deleted) {
      await post.decrement("likeCount");
      await post.reload();
    }

    res.json({ success: true, data: { likeCount: post.likeCount, liked: false } });
  } catch (error) {
    next(error);
  }
};

/** GET /api/social/posts/:postId/comments */
const listComments = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginationOf(req);
    const { count, rows } = await PostComment.findAndCountAll({
      where: { postId: req.params.postId, isDeleted: false },
      include: [{ association: "author", attributes: AUTHOR_ATTRIBUTES }],
      order: [["createdAt", "ASC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: { comments: rows, pagination: paginationMeta(count, page, limit) },
    });
  } catch (error) {
    next(error);
  }
};

/** POST /api/social/posts/:postId/comments */
const addComment = async (req, res, next) => {
  try {
    const body = (req.body.body || "").trim();
    if (!body) {
      return res.status(400).json({ success: false, message: "Comment body is required." });
    }

    const post = await Post.findOne({ where: { id: req.params.postId, isDeleted: false } });
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const comment = await PostComment.create({
      postId: post.id,
      userId: req.user.id,
      body,
    });
    await post.increment("commentCount");

    const created = await PostComment.findByPk(comment.id, {
      include: [{ association: "author", attributes: AUTHOR_ATTRIBUTES }],
    });

    res.status(201).json({ success: true, data: { comment: created } });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/social/comments/:commentId */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await PostComment.findByPk(req.params.commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }
    if (comment.userId !== req.user.id && !isAdmin(req.user)) {
      return res.status(403).json({ success: false, message: "You can only delete your own comments." });
    }

    comment.isDeleted = true;
    await comment.save();

    const post = await Post.findByPk(comment.postId);
    if (post && post.commentCount > 0) {
      await post.decrement("commentCount");
    }

    res.json({ success: true, message: "Comment deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  visibleVisibilitiesFor,
};
