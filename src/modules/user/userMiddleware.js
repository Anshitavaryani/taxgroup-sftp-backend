const httpStatus = require("http-status");

const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");

const { User } = require("../../models");
const {
  validatePassword,
} = require("../../commonServices/validatePasswordService");
const { validateEmail } = require("../../commonServices/validateEmailService");
const { verifyToken } = require("../../commonServices/tokenService");
const { tokenTypes } = require("../../config/token");

const validateSignUpRequestBodyUser = catchAsync(async (req, res, next) => {
  const { name, email_id, mobile_number, password, confirm_password } =
    req.body;

  let fileName = "";
  if (req.files.fileUpload) {
    for (let i = 0; i < req.files.fileUpload.length; i++) {
      if (
        req.files.fileUpload &&
        req.files.fileUpload[i] !== undefined &&
        req.files.fileUpload[i].filename !== undefined
      ) {
        if (fileName == "") {
          fileName = req.files.fileUpload[i].filename;
          // continue;
        } else {
          fileName += "," + req.files.fileUpload[i].filename;
        }
      }
    }
  }
  req.body.pictures = fileName;

  fileName = "";
  if (req.files.images) {
    for (let i = 0; i < req.files.images.length; i++) {
      if (
        req.files.images &&
        req.files.images[i] !== undefined &&
        req.files.images[i].filename !== undefined
      ) {
        if (fileName == "") {
          fileName = req.files.images[i].filename;
          // continue;
        } else {
          fileName += "," + req.files.images[i].filename;
        }
      }
    }
  }
  req.body.images = fileName;

  if (!name || !email_id || !mobile_number || !password || !confirm_password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Required Field missed !! [name,  email_id, mobile_number, password, confirm_password] can't be empty !!!!"
    );
  }

  if (!validateEmail(email_id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Email");
  }

  if (await User.isEmailTaken(email_id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  if (!validatePassword(password)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Password should have a minimum length of 8 characters and must have at least 2 digits and No Blank Space"
    );
  }

  if (password !== confirm_password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Password and Confirm Password must be equal"
    );
  }

  next();
});

const validateSignInRequestBodyUser = (req, res, next) => {
  const { email_id, password } = req.body;

  if (!email_id || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Please provide required fields"
    );
  }
  next();
};

const verifyUserToken = catchAsync(async (req, res, next) => {
  const token = req.headers["x-access-token"];

  let fileName = "";

  if (req.files?.fileUpload) {
    for (let i = 0; i < req.files.fileUpload.length; i++) {
      if (
        req.files.fileUpload[i] !== undefined &&
        req.files.fileUpload[i].filename !== undefined
      ) {
        if (fileName == "") {
          fileName = req.files.fileUpload[i].filename;
          // continue;
        } else {
          fileName += "," + req.files.fileUpload[i].filename;
        }
      }
    }
  }
  req.body.pictures = fileName;

  fileName = "";
  if (req.files?.images) {
    // use optional chaining operator
    for (let i = 0; i < req.files.images.length; i++) {
      if (
        req.files.images[i] !== undefined &&
        req.files.images[i].filename !== undefined
      ) {
        if (fileName == "") {
          fileName = req.files.images[i].filename;
          // continue;
        } else {
          fileName += "," + req.files.images[i].filename;
        }
      }
    }
  }
  req.body.images = fileName;

  const tokenObj = await tokenVerifier(token);

  if (tokenObj && tokenObj.status == "success") {
    req._user = tokenObj.tokenDoc;
    req.body.id = tokenObj.tokenDoc.user_id;
  } else {
    res.status(401).send({ message: "Token not valid" });
    return res;
  }

  next();
});

const tokenVerifier = async (token) => {
  try {
    const tokenDoc = await verifyToken(token, tokenTypes.REFRESH);
    return { status: "success", tokenDoc: tokenDoc };
  } catch (e) {
    console.log("Exception occured while verifying token: ", token, e);
    return { status: "fail" };
  }
};

module.exports = {
  validateSignInRequestBodyUser,
  validateSignUpRequestBodyUser,
  verifyUserToken,
};
