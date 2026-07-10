const { Follow, User } = require("../models");
const { notifyUser } = require("../utils/notify");

const USER_ATTRIBUTES = ["id", "firstName", "lastName", "profileImage", "primaryRole"];

const paginationOf = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
  return { page, limit, offset: (page - 1) * limit };
};

const paginationMeta = (count, page, limit) => ({
  total: count,
  page,
  limit,
  totalPages: Math.max(Math.ceil(count / limit), 1),
});

/** POST /api/social/follow/:userId */
const follow = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.userId, 10);

    if (targetUserId === req.user.id) {
      return res.status(400).json({ success: false, message: "You can't follow yourself." });
    }

    const target = await User.findByPk(targetUserId);
    if (!target || !target.isActive) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const [, created] = await Follow.findOrCreate({
      where: { followerId: req.user.id, followingId: targetUserId },
    });

    if (created) {
      await notifyUser(
        targetUserId,
        "follow",
        "New follower",
        `${req.user.firstName} ${req.user.lastName} started following you.`,
        `/profile/${req.user.id}`,
        { followerId: req.user.id },
      );
    }

    res.json({ success: true, data: { isFollowing: true } });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/social/follow/:userId */
const unfollow = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.userId, 10);
    await Follow.destroy({ where: { followerId: req.user.id, followingId: targetUserId } });
    res.json({ success: true, data: { isFollowing: false } });
  } catch (error) {
    next(error);
  }
};

/** GET /api/social/follow/:userId/followers */
const listFollowers = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginationOf(req);
    const { count, rows } = await Follow.findAndCountAll({
      where: { followingId: req.params.userId },
      include: [{ association: "follower", attributes: USER_ATTRIBUTES }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: {
        users: rows.map((r) => r.follower),
        pagination: paginationMeta(count, page, limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/social/follow/:userId/following */
const listFollowing = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginationOf(req);
    const { count, rows } = await Follow.findAndCountAll({
      where: { followerId: req.params.userId },
      include: [{ association: "followee", attributes: USER_ATTRIBUTES }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: {
        users: rows.map((r) => r.followee),
        pagination: paginationMeta(count, page, limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/social/follow/:userId/status */
const getStatus = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.userId, 10);

    const [isFollowing, isFollowedBy] = await Promise.all([
      Follow.findOne({ where: { followerId: req.user.id, followingId: targetUserId } }),
      Follow.findOne({ where: { followerId: targetUserId, followingId: req.user.id } }),
    ]);

    res.json({
      success: true,
      data: { isFollowing: !!isFollowing, isFollowedBy: !!isFollowedBy },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { follow, unfollow, listFollowers, listFollowing, getStatus };
