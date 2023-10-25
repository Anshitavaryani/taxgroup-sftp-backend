const catchAsync = require("../../utils/catchAsync");
const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const tokenService = require("../../commonServices/tokenService");
const pick = require("../../utils/pick");

const contactFormService = require("./contactFormService");

const createContactForm = catchAsync(async (req, res) => {
  const contact = await contactFormService.createContactForm(
    req.body.name,
    req.body.email_id,
    req.body.mobile_number,
    req.body.query
  );
  if (!contact) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Submit Query"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: contact,
    message: "Your Query successfully submitted  ",
  });
});

module.exports = {
  createContactForm,
};
