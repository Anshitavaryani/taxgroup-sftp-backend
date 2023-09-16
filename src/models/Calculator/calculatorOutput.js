const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../config/db");
// const { User } = require("../User/userModel");

class CalculatorOutput extends Model {}
CalculatorOutput.init(
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
    calculator_type: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: "calculator_output",
    timestamps: true,
    //   underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

CalculatorOutput.beforeUpdate(async (CalculatorOutput) => {
  CalculatorOutput.updated_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

CalculatorOutput.beforeDestroy(async (CalculatorOutput) => {
  CalculatorOutput.deleted_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

// sequelize
//   .sync()
//   .then(() => {
//     console.log("CalculatorOutput table created successfully");
//   })
//   .catch((err) => {
//     console.error(
//       "Unable to create the CalculatorOutput verification table:",
//       err
//     );
//   });

// CalculatorHistory.belongsTo(User, { foreignKey: "user_id" });
// User.hasMany(CalculatorHistory, { foreignKey: "user_id" });

module.exports = {
  CalculatorOutput,
};
