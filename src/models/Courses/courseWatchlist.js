const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../config/db");
const { Course } = require("./course");
const { studentReviews } = require("./studentReviews");
const { User } = require("../User/userModel");

class courseWatchlist extends Model {}

courseWatchlist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // watched_percentage: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    certificate_provided: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: "0",
    },
    certificate_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: "1",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "course_watchlist",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

courseWatchlist.beforeUpdate(async (courseWatchlist) => {
  courseWatchlist.updated_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

courseWatchlist.beforeDestroy(async (courseWatchlist) => {
  courseWatchlist.deleted_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

// sequelize
//   .sync()
//   .then(() => {
//     console.log("courseWatchlist Model table created successfully");
//   })
//   .catch((err) => {
//     console.error("Unable to create the coure watchlist verification table:", err);
//   });

// courseWatchlist.hasMany(Course, {
//   foreignKey: "id",
//   as: "course_details",
//   sourceKey: "course_id",
// });

courseWatchlist.hasMany(studentReviews, {
  foreignKey: "course_id",
  as: "student_review",
  sourceKey: "course_id",
});

courseWatchlist.hasMany(User, {
  foreignKey: "id",
  as: "user_profile_details",
  sourceKey: "user_id",
});

module.exports = {
  courseWatchlist,
};
