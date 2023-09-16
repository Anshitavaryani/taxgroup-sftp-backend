const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../config/db");
const { User } = require("../User/userModel");

class CalculatorHistory extends Model {}
CalculatorHistory.init(
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
    history: {
      type: DataTypes.TEXT,
      get: function () {
        return JSON.parse(this.getDataValue("history"));
      },
      set: function (value) {
        return this.setDataValue("history", JSON.stringify(value));
      },
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
    tableName: "calculator_history",
    timestamps: true,
    //   underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

CalculatorHistory.beforeUpdate(async (CalculatorHistory) => {
  CalculatorHistory.updated_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

CalculatorHistory.beforeDestroy(async (CalculatorHistory) => {
  CalculatorHistory.deleted_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

// sequelize
//   .sync({ alter: true })
//   .then(() => {
//     console.log("CalculatorHistory table created successfully");
//   })
//   .catch((err) => {
//     console.error(
//       "Unable to create the CalculatorHistory verification table:",
//       err
//     );
//   });

CalculatorHistory.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(CalculatorHistory, { foreignKey: "user_id" });

module.exports = {
  CalculatorHistory,
};
