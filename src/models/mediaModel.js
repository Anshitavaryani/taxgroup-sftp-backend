const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");

class media extends Model {}

media.init(
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
    file_name: {
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
    tableName: "media",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

media.beforeUpdate(async (media) => {
  media.updated_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

media.beforeDestroy(async (media) => {
  media.deleted_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

// sequelize
//   .sync()
//   .then(() => {
//     console.log("mediaModel table created successfully");
//   })
//   .catch((err) => {
//     console.error("Unable to create the CalculatorHistory verification table:", err);
//   });


module.exports = {
  media,
};
