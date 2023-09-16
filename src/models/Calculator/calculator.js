const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../config/db");
const { User } = require("../User/userModel");

class Calculator extends Model {}
Calculator.init(
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
    calculator_name: {
      type: DataTypes.ENUM("SAVINGS", "MORTGAGE", "DEBT", "BUDGET"),
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
    tableName: "calculator",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Calculator.beforeUpdate(async (Calculator) => {
  Calculator.updated_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

Calculator.beforeDestroy(async (Calculator) => {
  Calculator.deleted_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

// sequelize
//   .sync()
//   .then(() => {
//     console.log("Calculator table created successfully");
//   })
//   .catch((err) => {
//     console.error("Unable to create the Calculator verification table:", err);
//   });

//   Calculator.belongsTo(User, {
//     foreignKey: "user_id",
//     as: "user",
//     targetKey: "id",
//   });

module.exports = {
  Calculator,
};
