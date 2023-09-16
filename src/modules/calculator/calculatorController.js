const catchAsync = require("../../utils/catchAsync");
const moment = require("moment");
const httpStatus = require("http-status");

const { OTP } = require("../../models");
const { CalculatorType } = require("./calculatorUtil");
const calculatorService = require("./calculatorService");

const test = catchAsync(async (req, res) => {
  let obj = {
    email_id: "test@test.com",
    code: "123456",
    generated_at: moment(),
    expires_at: moment().add(5, "minutes").toDate(),
  };
  let otpDoc = await OTP.create(obj);
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: { message: "Please Verify Your Email" },
  });
});

const calculate = catchAsync(async (req, res) => {
  const calculatorType = req.body.calculatorType;
 
  const userId = req._user.user_id;
  let result;
  switch (calculatorType) {
    case CalculatorType.SAVINGS:
      result = await calculatorService.savingsCalculator(
        req.body.user_input,
        userId
      );
      break;
    case CalculatorType.BUDGET:
      result = await calculatorService.budgetCalculator(
        req.body.user_input,
        userId
      );
      break;
    case CalculatorType.MORTGAGE:
      result = await calculatorService.mortgageCalculator(
        req.body.user_input,
        userId
      );
      break;
    case "DEBT":
      result = await calculatorService.debtCalculator(
        req.body,
        userId
      );
      break;
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    ...result,
  });
});

//get user last 7 history
const getHistory = catchAsync(async (req, res) => {
  const user = await calculatorService.getHistory(req._user.user_id);
  res.status(httpStatus.OK).send({ code: httpStatus.OK, data: user });
});

//get history of particular calculator
const getHistoryByCalculatorType = catchAsync(async (req, res) => {
  const user = await calculatorService.getHistoryByCalculatorType(req._user.user_id, req.body.calculatorType);
  res.status(httpStatus.OK).send({ code: httpStatus.OK, data: user });
});

//get history for website
const getHistoryByCalculatorType1 = catchAsync(async (req, res) => {
  const user = await calculatorService.getHistoryByCalculatorType1(req._user.user_id, req.body.calculatorType);
  res.status(httpStatus.OK).send({ code: httpStatus.OK, data: user.data });
});

module.exports = {
  test,
  calculate,
  getHistory,
 getHistoryByCalculatorType,
 getHistoryByCalculatorType1
};
