const httpStatus = require("http-status");
const ApiError = require("../../../utils/ApiError");
const catchAsync = require("../../../utils/catchAsync");
const Roles = require("../../../config/roles");
const { verifyToken } = require("../../../commonServices/tokenService");
const { roles } = require("../../../models");
const { tokenTypes } = require("../../../config/token");

const validateSignInRequestBodyAdmin = (req, res, next) => {
  const { email, password } = req.body;
  req.body.admin_type = Roles.ADMIN;

  if (!email || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Please provide required fields"
    );
  }
  next();
};

const verifySuperAdminToken = catchAsync(async (req, res, next) => {
  const token = req.headers["x-access-token"];

  const editRoutes = ["/editUser1"];
const createRoutes = ["/createUser1"];
const deleteRoutes = ["/deleteUser1"];

  let fileName = "";
  if (req.files?.fileUpload) {
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
  if (req.files?.images) {
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

  const tokenObj = await tokenVerifier(token);
  let user_id;
  if (tokenObj && tokenObj.status == "success") {
    user_id = tokenObj.tokenDoc.user_id;
    req.body.id = user_id;
    req.body.ip_address = req.ip;
  } else {
    res.status(401).send({ message: "Token not valid" });
    return res;
  }

  const user_type = tokenObj.tokenDoc.user_type;
  if (user_type === Roles.SUPERADMIN) {
  } else if (user_type === Roles.SUBADMIN) {
    const userRoles = await roles.findAll({
      where: { admin_id: user_id },
      attributes: ["permission"],
      raw: true,
    });
    const userPermissions = userRoles.map((item) => item.permission);

    if (
      (editRoutes.includes(req.route.path) &&
        !userPermissions.includes("EDIT")) ||
      (createRoutes.includes(req.route.path) &&
        !userPermissions.includes("CREATE")) ||
      (deleteRoutes.includes(req.route.path) &&
        !userPermissions.includes("DELETE"))
    ) {
      //It's an edit or create or delete route now check if he don't have edit permission
      res
        .status(403)
        .send({ message: "You are not authroized to access this" });
    }
  } else if (user_type == Roles.ADMIN) {
    if (
      editRoutes.includes(req.route.path) ||
      createRoutes.includes(req.route.path) ||
      deleteRoutes.includes(req.route.path)
    ) {
      res
        .status(403)
        .send({ message: "You are not authroized to access this" });
    }
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
  validateSignInRequestBodyAdmin,
  verifySuperAdminToken,
};
