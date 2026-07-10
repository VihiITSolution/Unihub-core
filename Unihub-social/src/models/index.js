const sequelize = require("../config/sequelize");
const User = require("./User");
const Post = require("./Post");
const PostLike = require("./PostLike");
const PostComment = require("./PostComment");
const Follow = require("./Follow");

User.hasMany(Post, { foreignKey: "userId", as: "posts" });
Post.belongsTo(User, { foreignKey: "userId", as: "author" });

Post.hasMany(PostLike, { foreignKey: "postId", as: "likes" });
PostLike.belongsTo(Post, { foreignKey: "postId", as: "post" });
User.hasMany(PostLike, { foreignKey: "userId", as: "postLikes" });
PostLike.belongsTo(User, { foreignKey: "userId", as: "user" });

Post.hasMany(PostComment, { foreignKey: "postId", as: "comments" });
PostComment.belongsTo(Post, { foreignKey: "postId", as: "post" });
User.hasMany(PostComment, { foreignKey: "userId", as: "postComments" });
PostComment.belongsTo(User, { foreignKey: "userId", as: "author" });

User.hasMany(Follow, { foreignKey: "followerId", as: "following" });
Follow.belongsTo(User, { foreignKey: "followerId", as: "follower" });
User.hasMany(Follow, { foreignKey: "followingId", as: "followers" });
Follow.belongsTo(User, { foreignKey: "followingId", as: "followee" });

module.exports = {
  sequelize,
  User,
  Post,
  PostLike,
  PostComment,
  Follow,
};
