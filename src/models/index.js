const { UserToken } = require("./userTokenModel");
const { userLoginTiming } = require("./userLoginTimingModel");
const { media } = require("./mediaModel");
const { OTP } = require("./otpModel");
const { User } = require("./User/userModel");
const { CalculatorHistory } = require("./Calculator/calculatorHistory");
const { Calculator } = require("./Calculator/calculator");
const { CalculatorDetails } = require("./Calculator/calculatorDetails");
const { Forum } = require("./Forum/forum");
const { Admin } = require("./Admin/adminModel");
const { roles } = require("./Admin/roleModel");
const { Course } = require("./Courses/course");
const { courseSection } = require("./Courses/courseSection");
const { sectionDetails } = require("./Courses/sectionDetails");
const { courseWatchlist } = require("./Courses/courseWatchlist");
const { studentReviews } = require("./Courses/studentReviews");
const { courseInclude } = require("./Courses/courseInclude");
const {userProgress} = require("./Courses/userProgress")
const {CalculatorOutput} = require("./Calculator/calculatorOutput.js")

module.exports = {
  UserToken,
  userLoginTiming,
  media,
  User,
  OTP,
  CalculatorDetails,
  Calculator,
  CalculatorHistory,
  Forum,
  Admin,
  roles,
  courseSection,
  sectionDetails,
  courseInclude,
  courseWatchlist,
  Course,
  studentReviews,
  userProgress
};
