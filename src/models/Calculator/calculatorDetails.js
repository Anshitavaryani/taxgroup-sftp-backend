const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../config/db");

class CalculatorDetails extends Model {}
CalculatorDetails.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    calculator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    input: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    input_value: {
      type: DataTypes.STRING, 
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
    tableName: "calculator_details",
    timestamps: true,
   // underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

CalculatorDetails.beforeUpdate(async (CalculatorDetails) => {
  CalculatorDetails.updated_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

CalculatorDetails.beforeDestroy(async (CalculatorDetails) => {
  CalculatorDetails.deleted_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

// sequelize
//   .sync()
//   .then(() => {
//     console.log("CalculatorDetails table created successfully");
//   })
//   .catch((err) => {
//     console.error("Unable to create the CalculatorDetails verification table:", err);
//   });



module.exports = {
  CalculatorDetails,
};
