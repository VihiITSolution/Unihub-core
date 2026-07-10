const { Op } = require("sequelize");
const { User, Post, Follow } = require("../models");
const { toPublicUrl } = require("../config/upload");
const { visibleVisibilitiesFor } = require("./postController");

/** PUT /api/social/profile/picture */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided." });
    }

    const profileImage = toPublicUrl("avatars", req.file.filename);
    req.user.profileImage = profileImage;
    await req.user.save();

    res.json({
      success: true,
      message: "Profile photo updated successfully.",
      data: { profileImage, user: req.user },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/social/profile/:userId */
const getPublicProfile = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.userId, 10);

    const user = await User.findOne({
      where: { id: targetUserId, isActive: true },
      attributes: ["id", "firstName", "lastName", "bio", "profileImage", "primaryRole"],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isOwnProfile = req.user?.id === targetUserId;
    const allowedVisibilities = await visibleVisibilitiesFor(req.user?.id, targetUserId);

    const [postCount, followerCount, followingCount, isFollowing, isFollowedBy] =
      await Promise.all([
        Post.count({
          where: {
            userId: targetUserId,
            isDeleted: false,
            visibility: { [Op.in]: allowedVisibilities },
          },
        }),
        Follow.count({ where: { followingId: targetUserId } }),
        Follow.count({ where: { followerId: targetUserId } }),
        req.user
          ? Follow.findOne({ where: { followerId: req.user.id, followingId: targetUserId } })
          : null,
        req.user
          ? Follow.findOne({ where: { followerId: targetUserId, followingId: req.user.id } })
          : null,
      ]);

    res.json({
      success: true,
      data: {
        user,
        counts: { posts: postCount, followers: followerCount, following: followingCount },
        isOwnProfile,
        isFollowing: !!isFollowing,
        isFollowedBy: !!isFollowedBy,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadAvatar, getPublicProfile };
