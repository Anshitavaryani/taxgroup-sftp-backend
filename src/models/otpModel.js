const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");
const { Sequelize } = require("sequelize");

class OTP extends Model {}

OTP.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    email_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_valid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    generated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: "otpverification",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

OTP.beforeUpdate(async (OTP) => {
  OTP.updated_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

OTP.beforeDestroy(async (OTP) => {
  OTP.deleted_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

// sequelize.sync()
//   .then(() => {
//     console.log('otp verification table created successfully');
//   })
//   .catch((err) => {
//     console.error('Unable to create the otp verification table:', err);
//   });

module.exports = {
  OTP,
};
