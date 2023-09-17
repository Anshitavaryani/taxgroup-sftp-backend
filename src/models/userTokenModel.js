const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class UserToken extends Model {}
UserToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    user_type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ["USER", "ADMIN", "SUB-ADMIN", "SUPER-ADMIN"],
      defaultValue: "USER",
    },
    token_type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ["REFRESH", "ACCESS"],
      defaultValue: "ACCESS",
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    fcm_token: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "active",
    },
    expired_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "user_tokens",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

UserToken.beforeUpdate(async (UserToken) => {
  UserToken.updated_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

UserToken.beforeDestroy(async (UserToken) => {
  UserToken.deleted_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

// sequelize.sync()
//   .then(() => {
//     console.log('User token table created successfully');
//   })
//   .catch((err) => {
//     console.error('Unable to create the User verification table:', err);
//   });

// Export model
module.exports = {
  UserToken,
};
