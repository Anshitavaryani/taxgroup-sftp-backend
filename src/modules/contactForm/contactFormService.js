const { Sequelize, QueryTypes, where } = require("sequelize");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
const { User, contactForm } = require("../../models");

const createContactForm = async (
  name,
  email_id,
  mobile_number,
  query
) => {
  // const userDoc = await User.findOne({ where: { id: user_id } });
  // if (!userDoc) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  // }
  const contactFormObj = {
    name: name,
    // user_id: userDoc.id,
    email_id: email_id,
    mobile_number: mobile_number,
    query: query,
  };

  const contactFormDoc = await contactForm.create(contactFormObj);
  if (!contactFormDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }

  return contactFormDoc;
};

module.exports = {
  createContactForm,
};
