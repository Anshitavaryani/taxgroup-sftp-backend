const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const moment = require("moment");
let randomize = require("randomatic");
const { Sequelize, QueryTypes, where } = require("sequelize");

const { sequelize } = require("../../config/db");
const { tokenTypes } = require("../../config/token");
const ApiError = require("../../utils/ApiError");

const { validateEmail } = require("../../commonServices/validateEmailService");
const {
  validatePassword,
} = require("../../commonServices/validatePasswordService");
const tokenService = require("../../commonServices/tokenService");

const {
  User,
  OTP,
  UserToken,
  userLoginTiming,
  Calculator,
  CalculatorDetails,
  CalculatorHistory,
  Forum,
  studentReviews,
  courseWatchlist,
  userProgress,
} = require("../../models");
const {
  sendOTP,
  sendForgetPasswordOTP,
  sendResetPasswordConfirmationMail,
} = require("../../commonServices/emailService");
const {
  CalculatorOutput,
} = require("../../models/Calculator/calculatorOutput");

// Sending Otp for Sign Up and forget password
const sendVerificationOTP = async (email_id, request_type) => {
  if (
    (request_type != undefined && request_type != "") ||
    request_type != null
  ) {
    if (request_type === "Register" && (await User.isEmailTaken(email_id))) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }
  }
  if (!validateEmail(email_id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Email");
  }

  const otp = randomize("0", 6);
  if (request_type === "Register") {
    let isSend = await sendOTP(email_id, otp);
    if (!isSend) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Unable to send OTP to This Email"
      );
    }
  } else {
    let isSend = await sendForgetPasswordOTP(email_id, otp);
    if (!isSend) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Unable to send OTP to This Email"
      );
    }
  }

  let obj = {
    email_id: email_id,
    code: otp,
    generated_at: moment(),
    expires_at: moment().add(5, "minutes").toDate(),
  };
  await OTP.update({ is_valid: 0 }, { where: { email_id: email_id } });
  let otpDoc = await OTP.create(obj);
  return otpDoc;
};

//verify OTP
const verifyOTP = async (email_id, otp) => {
  const myOtp = await OTP.findOne({
    where: { email_id: email_id, code: otp, is_valid: 1 },
  });

  if (!myOtp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP Entered");
  }
  if (myOtp.used === 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP has already user");
  }

  if (myOtp.expires_at < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP has already Expired");
  }

  await OTP.update(
    { used: 1, is_verified: 1, is_valid: 0 },
    { where: { email_id: email_id, code: otp } }
  );
  return true;
};

// Sign Up User With username, name, email, password, re-enterPassword
const registerUser = async (userBody) => {
  const {
    name,
    email_id,
    mobile_number,
    password,
    confirm_password,
    pictures,
  } = userBody;

  const is_otp_verified = await OTP.findOne({
    where: { email_id: email_id, is_verified: 1 },
  });
  if (!is_otp_verified) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Please Verify Your Email First"
    );
  }

  let salt = bcrypt.genSaltSync(10);

  let Password = bcrypt.hashSync(password, salt);
  const userObj = {
    name: name,
    email_id: email_id,
    mobile_number: mobile_number,
    password: Password,
    confirm_password: Password,
    is_verified: 1,
    is_active: 1,
    profile_picture: pictures ? pictures : "",
  };
  console.log("profile====>", pictures);
  const user = await User.create(userObj);

  if (!user) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to create User"
    );
  }
  return user;
};

// Log In User By with email and password and return access token and refresh token
const login = async (userBody) => {
  const { email_id, password } = userBody;

  const user = await User.findOne({
    where: { email_id: email_id, is_verified: 1 },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const passwordIsValid = bcrypt.compareSync(password, user.password);
  if (!passwordIsValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Password");
  }
  await saveLoginTiming(user);

  var isTokenExist = await UserToken.findOne({
    where: {
      user_id: user.id,
      status: 1,
      user_type: user.user_type,
      token_type: "refresh",
    },
    limit: 1,
    order: [["id", "desc"]],
  });

  let userObj = {
    id: user.id,
    name: user.name,
    user_type: user.user_type,
    email_id: user.email_id,
    mobile_number: user.mobile_number,
    is_verified: user.is_verified,
    profile_picture: user.profile_picture,
  };
  return userObj;
};

const saveLoginTiming = async (user) => {
  const data = await getLastRecordOfsameUser(user.id);

  if (data.logout_time !== undefined && data.logout_time === null) {
    await userLoginTiming.update(
      { logout_time: moment(), is_active: 0 },
      {
        where: {
          user_id: data.user_id,
          is_active: 1,
        },
      }
    );
  }

  let obj = {
    user_id: user.id,
    login_time: moment(),
    user_type: user.user_type,
    created_at: moment(),
  };
  const timingDetails = await userLoginTiming.create(obj);
  return timingDetails;
};

const getLastRecordOfsameUser = async (user_id) => {
  let sql = `SELECT * FROM user_login_timing WHERE user_id=${user_id}
    ORDER BY Id DESC limit 1`;
  let userTimingData = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
  });
  return userTimingData[0] ? userTimingData[0] : {};
};

const logout = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please Provide Token");
  }

  const refreshTokenDoc = await UserToken.findOne({
    where: {
      token: refreshToken,
      token_type: tokenTypes.REFRESH,
      status: "active",
    },
  });
  if (
    refreshTokenDoc === undefined ||
    refreshTokenDoc === null ||
    Object.keys(refreshTokenDoc).length === 0
  ) {
    throw new ApiError(httpStatus.NOT_FOUND, "Token Not found");
  }
  let status = await UserToken.destroy({
    where: { token: refreshTokenDoc.token },
  });

  await saveLogoutTiming(refreshTokenDoc.user_id, refreshTokenDoc.user_type);
  return status;
};

const saveLogoutTiming = async (user_id) => {
  const data = await getLastRecordOfsameUser(user_id);
  const timingDetails = await userLoginTiming.update(
    {
      logout_time: moment(),
      updated_at: moment(),
      is_active: 0,
    },
    { where: { user_id: data.user_id, is_active: 1 } }
  );
  return timingDetails;
};

// get refresh token by access token
const refreshAuth = async (refreshToken) => {
  const refreshTokenDoc = await tokenService.verifyToken(
    refreshToken,
    tokenTypes.REFRESH
  );

  const user = await User.findOne({
    where: { id: refreshTokenDoc.user_id },
  });

  if (!user || user.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  }
  await UserToken.destroy({
    where: { token: refreshTokenDoc.token },
  });
  return tokenService.generateAuthTokens(user);
};

//get profle by token
const getUserProfileByRefreshToken = async (refreshToken, user_type) => {
  const refreshTokenDoc = await tokenService.verifyToken(
    refreshToken,
    tokenTypes.REFRESH
  );

  const user = await User.findOne({
    where: { id: refreshTokenDoc.user_id, is_verified: 1 },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  }

  let userObj = {
    id: user.id,
    name: user.name,
    email_id: user.email_id,
    mobile_number: user.mobile_number,
    password: user.password,
    confirm_password: user.password,
    user_type: user.user_type,
    is_email_verify: user.is_email_verify,
    profile_picture: user.profile_picture,
  };
  return userObj;
};

//update User
const updateUser = async (filter, options) => {
  const user = await User.findOne({
    where: { email_id: filter["email_id"] },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const userObj = {};

  if (
    typeof filter != "undefined" &&
    filter["name"] != "" &&
    typeof filter["name"] != "undefined" &&
    filter["name"] !== user["name"]
  ) {
    userObj["name"] = filter["name"];
  }
  if (
    typeof filter != "undefined" &&
    filter["email_id"] != "" &&
    typeof filter["email_id"] != "undefined" &&
    filter["email_id"] !== user["email_id"]
  ) {
    userObj["email_id"] = filter["email_id"];
  }
  if (
    typeof filter != "undefined" &&
    filter["pictures"] != "" &&
    typeof filter["pictures"] != "undefined" &&
    filter["pictures"] !== user["profile_picture"]
  ) {
    userObj["profile_picture"] = filter["pictures"];
  }

  if (
    typeof filter != "undefined" &&
    filter["mobile_number"] != "" &&
    typeof filter["mobile_number"] != "undefined" &&
    filter["mobile_number"] !== user["mobile_number"]
  ) {
    userObj["mobile_number"] = filter["mobile_number"];
  }

  const userDoc = await user.update(userObj, {
    where: { id: user.id },
  });
  if (!userDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Unable to edit User");
  }
  console.log("userrrr====>", userDoc);
  return userDoc;
};

//forget password
const forgetPassword = async (email_id, otp, password, confirm_password) => {
  if (!email_id || !otp || !password || !confirm_password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please Enter Required Fields");
  }

  const user = await User.findOne({
    where: { email_id: email_id },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  }
  const myOtp = await OTP.findOne({
    where: { email_id: email_id, code: otp, is_valid: 1 },
  });

  if (!myOtp || Object.keys(myOtp).length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP Entered");
  }
  if (myOtp.used === 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP has already taken");
  }

  if (myOtp.expires_at < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP has already Expired");
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

  await OTP.update(
    { used: 1, is_verified: 1, is_valid: 0 },
    { where: { email_id: email_id, code: otp } }
  );

  let salt = bcrypt.genSaltSync(10);
  let isUpdate = await User.update(
    {
      password: bcrypt.hashSync(password, salt),
      updated_at: moment(),
    },
    {
      where: { email_id: user.email_id },
    }
  );
  if (isUpdate) {
    await sendResetPasswordConfirmationMail(user.email_id);
  }
  return isUpdate;
};

//change password
const changePassword = async (
  id,
  old_password,
  new_password,
  confirm_password
) => {
  if (!old_password || !new_password || !confirm_password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please Enter Required Fields");
  }

  const user = await User.findOne({
    where: { id: id },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  }
  if (!validatePassword(new_password)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Password should have a minimum length of 8 characters and must have at least 2 digits and No Blank Space"
    );
  }
  const isPasswordValid = bcrypt.compareSync(old_password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Old Password");
  }

  if (new_password !== confirm_password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      " New Password and Confirm Password must be equal"
    );
  }

  let salt = bcrypt.genSaltSync(10);
  let isUpdate = await User.update(
    {
      password: bcrypt.hashSync(new_password, salt),
      updated_at: moment(),
    },
    {
      where: { id: id },
    }
  );
  if (isUpdate) {
    await sendResetPasswordConfirmationMail(user.email_id);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, "Unable to change password");
  }

  return isUpdate;
};

//delete account
const deleteAccount = async (refreshToken) => {
  const refreshTokenDoc = await tokenService.verifyToken(
    refreshToken,
    tokenTypes.REFRESH
  );
  console.log("userdetails=======>", refreshToken, tokenTypes.REFRESH);

  const user = await User.findOne({
    where: { id: refreshTokenDoc.user_id },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  }

  console.log("user======>", user, refreshTokenDoc.user_id);

  // Delete entries associated with the user
  await Calculator.destroy({ where: { user_id: refreshTokenDoc.user_id } });
  await CalculatorHistory.destroy({
    where: { user_id: refreshTokenDoc.user_id },
  });
  await CalculatorOutput.destroy({
    where: { user_id: refreshTokenDoc.user_id },
  });
  await Forum.destroy({ where: { user_id: refreshTokenDoc.user_id } });
  await studentReviews.destroy({
    where: { user_id: refreshTokenDoc.user_id },
  });
  await courseWatchlist.destroy({
    where: { user_id: refreshTokenDoc.user_id },
  });
  await userProgress.destroy({
    where: { user_id: refreshTokenDoc.user_id },
  });

  await CalculatorHistory.destroy({
    where: { user_id: refreshTokenDoc.user_id },
  });

  const deletedUser = await User.destroy({
    where: { id: refreshTokenDoc.user_id },
  });

  if (deletedUser !== 1) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User deletion failed"
    );
  }
};

module.exports = {
  sendVerificationOTP,
  verifyOTP,
  registerUser,
  refreshAuth,
  login,
  logout,
  getUserProfileByRefreshToken,
  updateUser,
  forgetPassword,
  changePassword,
  deleteAccount,
};
