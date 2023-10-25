const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../config/db");

class contactForm extends Model {}
contactForm.init(
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
    email_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    query: {
      type: DataTypes.TEXT,
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
    tableName: "contact_form",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

contactForm.beforeUpdate(async (contactForm) => {
  contactForm.updated_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

contactForm.beforeDestroy(async (contactForm) => {
  contactForm.deleted_at = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/g, "");
});

// sequelize
//   .sync()
//   .then(() => {
//     console.log("contactForm table created successfully");
//   })
//   .catch((err) => {
//     console.error("Unable to create the contactForm verification table:", err);
//   });

module.exports = {
  contactForm,
};
