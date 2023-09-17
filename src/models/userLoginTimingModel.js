const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class userLoginTiming extends Model {}

userLoginTiming.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    login_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    logout_time: {
      type: DataTypes.DATE,
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
    tableName: "user_login_timing",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

userLoginTiming.beforeUpdate(async (userLoginTiming) => {
  userLoginTiming.updated_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

userLoginTiming.beforeDestroy(async (userLoginTiming) => {
  userLoginTiming.deleted_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

// sequelize.sync()
//   .then(() => {
//     console.log('userLoginTiming table created successfully');
//   })
//   .catch((err) => {
//     console.error('Unable to create the userLoginTiming verification table:', err);
//   });

module.exports = {
  userLoginTiming,
};
