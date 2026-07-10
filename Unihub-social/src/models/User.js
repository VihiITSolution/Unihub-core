const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

// Thin, non-authoritative mirror of Unihub-backend's users table. This
// service only reads/updates the columns it needs (auth + avatar + display
// info) and never runs sync/alter against it - Unihub-backend owns the
// schema for this table.
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "last_name",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    roles: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ["student"],
    },
    primaryRole: {
      type: DataTypes.ENUM("student", "tutor", "vendor", "admin"),
      allowNull: false,
      defaultValue: "student",
      field: "primary_role",
    },
    bio: {
      type: DataTypes.TEXT,
    },
    profileImage: {
      type: DataTypes.STRING(255),
      field: "profile_image",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

module.exports = User;
