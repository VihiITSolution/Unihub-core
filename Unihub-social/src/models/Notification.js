const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

// Thin, non-authoritative mirror of Unihub-backend's notifications table
// (src/models/Notification.js there). This service only inserts rows for
// social events (follow/post_like/post_comment) - Unihub-backend owns the
// schema/ENUM and serves the read/mark-read/delete API the frontend uses.
const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    type: {
      type: DataTypes.ENUM(
        "tutor_approved",
        "tutor_rejected",
        "course_approved",
        "course_rejected",
        "enrollment",
        "payment",
        "general",
        "follow",
        "post_like",
        "post_comment",
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_read",
    },
    link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "read_at",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "notifications",
    timestamps: false,
  },
);

module.exports = Notification;
