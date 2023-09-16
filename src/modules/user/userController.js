const httpStatus = require("http-status");

const catchAsync = require("../../utils/catchAsync");
const ApiError = require("../../utils/ApiError");
const tokenService = require("../../commonServices/tokenService");
const pick = require("../../utils/pick");

const userService = require("./userService");

//send otp for email verification and forget password
const sendVerificationOTP = catchAsync(async (req, res) => {
  const otpDoc = await userService.sendVerificationOTP(
    req.body.email_id,
    req.body.request_type
  );
  if (!otpDoc) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Unable to send OTP");
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: { message: "Please Verify Your Email" },
  });
});

//verify OTP
const verifyOTP = catchAsync(async (req, res) => {
  const status = await userService.verifyOTP(req.body.email_id, req.body.otp);
  if (!status) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Some Error Occured");
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: { message: "Your OTP is Verified Please Create Your Profile" },
  });
});

//register user
const registerUser = catchAsync(async (req, res) => {
  const user = await userService.registerUser(req.body);
  if (!user) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Some Error Occured");
  }
  res.status(httpStatus.CREATED).send({
    code: httpStatus.CREATED,
    data: { message: "New User Created" },
  });
});

//login
const login = catchAsync(async (req, res) => {
  const user = await userService.login(req.body);

  // console.log(user);
  
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
   const tokens = await tokenService.generateAuthTokens(user);

  res
    .status(httpStatus.OK)
    .send({ code: httpStatus.OK, data: { user, tokens } });
});

//logout
const logout = catchAsync(async (req, res) => {
  await userService.logout(req.body.refreshToken);
  res
    .status(httpStatus.OK)
    .send({ code: httpStatus.OK, message: "Successfully Logged Out" });
});

//get refresh token
const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await userService.refreshAuth(req.body.refreshToken);
  res.status(httpStatus.OK).send({ code: httpStatus.OK, date: { ...tokens } });
});

//get profile by token
const getUserProfileByRefreshToken = catchAsync(async (req, res) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No token provided!");
  }
  const user = await userService.getUserProfileByRefreshToken(token);
  res.status(httpStatus.OK).send({ code: httpStatus.OK, data: user });
});

//update User
const updateUser = catchAsync(async (req, res) => {
  const filter = pick(req.body, [
    "id",
    "name",
    "email_id",
    "mobile_number",
    "pictures",
  ]);
  const options = pick(req.body, ["sortBy", "limit", "page"]);
  const mentee = await userService.updateUser(filter, options);
  if (!mentee) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to update User"
    );
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: mentee,
    message: "Successfully updated User",
  });
});

//forget password
const forgetPassword = catchAsync(async (req, res) => {
  let status = await userService.forgetPassword(
    req.body.email_id,
    req.body.otp,
    req.body.password,
    req.body.confirm_password,
  );
  if (!status) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed To Reset Password"
    );
  }
  res
    .status(httpStatus.OK)
    .send({
      code: httpStatus.OK,
      message: "Your Password Changed Successfully, Please login to continue",
    });
});

//change password
const changePassword = catchAsync(async (req, res) => {
  let status = await userService.changePassword(
    req.body.id,
    req.body.old_password,
    req.body.new_password,
    req.body.confirm_password,
  );
  if (!status) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed To Change Password"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    message: "Your Password Changed Successfully, Please login to continue",
  });
});

//delete account
const deleteAccount = catchAsync(async (req, res) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No token provided!");
  }
  const user = await userService.deleteAccount(token);
  res.status(httpStatus.OK).send({ code: httpStatus.OK, data: user });
});



module.exports = {
  sendVerificationOTP,
  verifyOTP,
  registerUser,
  login,
  logout,
  refreshTokens,
  getUserProfileByRefreshToken,
  updateUser,
  forgetPassword,
  changePassword,
  deleteAccount
};
