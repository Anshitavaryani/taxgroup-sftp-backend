const { Sequelize, QueryTypes, Op } = require("sequelize");
const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const { CalculatorType } = require("./calculatorUtil");
const {
  Calculator,
  CalculatorDetails,
  CalculatorHistory,
} = require("../../models");
const tokenService = require("../../commonServices/tokenService");
const {
  CalculatorOutput,
} = require("../../models/Calculator/calculatorOutput");
const sequelize = require("sequelize");

// Calculate the debt free date

// Function for deep copying objects or arrays
function deepCopy(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    const newArray = [];
    for (let i = 0; i < obj.length; i++) {
      newArray[i] = deepCopy(obj[i]);
    }
    return newArray;
  }

  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepCopy(obj[key]);
    }
  }
  return newObj;
}

//Calculate Savings For Savings Calculator
function calculateTotalSavings(
  initialDeposit,
  monthlyContribution,
  period,
  durationUnit,
  apy
) {
  // const initialDeposit = parseFloat(initialDeposit);
  // const monthlyContribution = parseFloat(monthlyContribution);
  // let period = parseInt(period);
  // const durationUnit = durationUnit.toLowerCase();
  // const apy = parseFloat(apy);

  if (
    isNaN(initialDeposit) ||
    isNaN(monthlyContribution) ||
    isNaN(period) ||
    isNaN(apy)
  ) {
    return "Invalid input. Please enter valid numbers.";
  }

  if (durationUnit !== "months" && durationUnit !== "years") {
    return "Invalid duration unit. Please enter 'months' or 'years'.";
  }

  let numOfYears = period;

  let totalContributions = monthlyContribution * 12 * numOfYears;

  // Convert duration to months if the input durationUnit is 'years'
  if (durationUnit === "years") {
    period *= 12;
  }

  let month = 1;
  let endingBalance = initialDeposit;
  let r = apy / 100;
  let totalSavings = initialDeposit; // Initialize totalSavings with the initial deposit
  let interest = 0;

  while (month <= period) {
    //   console.log(endingBalance)
    interest = Number(endingBalance * Math.pow(1 + r, 1 / 12));
    endingBalance = Number(interest + monthlyContribution);
    totalSavings += monthlyContribution; // Add monthly contribution to totalSavings
    month++;
  }

  return {
    initialDeposit: initialDeposit.toFixed(2),
    totalSavings: (
      endingBalance -
      initialDeposit -
      monthlyContribution * 12 * numOfYears +
      totalContributions +
      initialDeposit
    ).toFixed(2),
    interestEarned: (
      endingBalance -
      initialDeposit -
      monthlyContribution * 12 * numOfYears
    ).toFixed(2),
    totalContributions: totalContributions.toFixed(2),
  };
}

//Calculate Mortgage Function
function calculateMortgage(
  homePrice,
  downPaymentPercentage,
  loanTerm,
  interestRate
) {
  // Calculate down payment amount

  var downPaymentAmount = (downPaymentPercentage / 100) * homePrice;

  // Calculate loan amount
  var loanAmount = homePrice - downPaymentAmount;

  // Calculate monthly interest rate
  var monthlyInterestRate = interestRate / 100 / 12;

  // Calculate number of payments
  var numberOfPayments = loanTerm * 12;

  // Calculate mortgage payment
  var monthlyPayment =
    (loanAmount * monthlyInterestRate) /
    (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));

  return monthlyPayment.toFixed(2);
}

//savings calculator
const savingsCalculator = async (reqBody, userId) => {
  //Calculator Entry
  const newCalculator = await Calculator.create({
    user_id: userId,
    calculator_name: "SAVINGS",
  });

  // Assign values to other fields if needed
  newCalculator.created_at = new Date();
  newCalculator.updated_at = new Date();

  const initialDeposit = Number(reqBody.initialDeposit);
  const monthlyContribution = Number(reqBody.monthlyContribution);
  const period = Number(reqBody.period);
  const durationUnit = reqBody.durationUnit;
  const apy = Number(reqBody.apy); // Apply decimal precision formatting

  console.log(
    "MONTHLYCONTRIBUTION :" + monthlyContribution + "PERIOD :" + period
  );

  const savingsData = calculateTotalSavings(
    initialDeposit,
    monthlyContribution,
    period,
    durationUnit,
    apy
  );

  await pushDataToCalculatorDetails(newCalculator.id, reqBody);

  // Prepare the response object
  const response = {
    calculatorType: CalculatorType.SAVINGS,
    calculatorOutput: {
      totalSavings: savingsData.totalSavings,
      initialDeposit: savingsData.initialDeposit,
      interestEarned: savingsData.interestEarned,
      totalContribution: savingsData.totalContributions,
    },
  };
  await pushDataToCalculatorHistory(response, userId);
  await pushDataToCalculatorOutput(response, userId, "SAVINGS");
  return response;
};

//create an entry in calculator history table
async function pushDataToCalculatorHistory(response, userId) {
  const calculatorHistory = await CalculatorHistory.findOne({
    where: { user_id: userId },
  });

  // console.log("CALCULATOR HISTORY : " + calculatorHistory.history);

  let historyArray = calculatorHistory ? calculatorHistory.history : [];

  //  console.log("typeofhistoryarryyyy======>",typeof(historyArray),historyArray,typeof(JSON.parse(historyArray)))

  if (historyArray.length > 7) {
    historyArray.shift();
  }

  historyArray.push(response);

  if (calculatorHistory) {
    await CalculatorHistory.update(
      { history: historyArray },
      { where: { user_id: userId } }
    );
  } else {
    await CalculatorHistory.create({ user_id: userId, history: historyArray });
  }
}

async function pushDataToCalculatorOutput(response, userId, calculatorType) {
  await CalculatorOutput.create({
    user_id: userId,
    calculator_type: calculatorType,
    history: response,
  });
}

//create an entry in calculator details table
async function pushDataToCalculatorDetails(calculatorId, reqBody) {
  for (let key in reqBody) {
    const input = key;
    const input_value = reqBody[key];

    const calculatorDetailsEntry = await CalculatorDetails.create({
      calculator_id: calculatorId,
      input: input,
      input_value: input_value,
    });
  }
}

//create an entry in calculator details table for debt calculator
async function pushDataToCalculatorDetailsForDebt(calculatorId, reqBody) {
  for (let key in reqBody) {
    const input = key;
    let input_value = reqBody[key];

    // Convert input_value to string if it's an array or an object
    if (typeof input_value === "object") {
      input_value = JSON.stringify(input_value);
    }

    const calculatorDetailsEntry = await CalculatorDetails.create({
      calculator_id: calculatorId,
      input: input,
      input_value: input_value.toString(),
    });
  }
}

//mortgage calculator
const mortgageCalculator = async (reqBody, userId) => {
  // Calculator Entry
  const newCalculator = await Calculator.create({
    user_id: userId,
    calculator_name: "MORTGAGE",
  });

  // Assign values to other fields if needed
  newCalculator.created_at = new Date();
  newCalculator.updated_at = new Date();

  const { homePrice, downPayment, rateOfInterest, durationOfLoan } = reqBody;

  // Validation: Check if all required fields are provided
  if (!homePrice || !downPayment || !rateOfInterest || !durationOfLoan) {
    throw new Error("Missing required fields");
  }

  // Calculate principal and interest
  const monthlyInterestRate = rateOfInterest / 100 / 12;
  const loanDurationInMonths = durationOfLoan * 12;
  const principalAndInterest =
    ((homePrice - downPayment) * monthlyInterestRate) /
    (1 - Math.pow(1 + monthlyInterestRate, -loanDurationInMonths));

  // Calculate other parameters (with default values if not provided)
  const creditScore = reqBody.creditScore || 0;
  const propertyTaxPerMonth = reqBody.propertyTaxPerMonth || 0;
  const homeownersInsurancePerMonth = reqBody.homeownersInsurancePerMonth || 0;
  const pmiPerMonth = reqBody.pmiPerMonth || 0;
  const hoaFeesPerMonth = reqBody.hoaFeesPerMonth || 0;

  // Calculate total monthly payment
  const totalMonthlyPayment =
    principalAndInterest +
    propertyTaxPerMonth +
    homeownersInsurancePerMonth +
    pmiPerMonth +
    hoaFeesPerMonth;

  await pushDataToCalculatorDetails(newCalculator.id, reqBody);

  const response = {
    calculatorType: CalculatorType.MORTGAGE,
    calculatorOutput: {
      principalAndInterest,
      propertyTaxPerMonth,
      homeownersInsurancePerMonth,
      pmiPerMonth,
      hoaFeesPerMonth,
      totalMonthlyPayment,
    },
  };
  await pushDataToCalculatorHistory(response, userId);
  await CalculatorOutput.create({
    user_id: userId,
    history: response,
    calculator_type: "MORTGAGE",
  });
  return response;
};

//debt calculator
const debtCalculator = async (reqBody, userId) => {
  const userDebts = deepCopy(reqBody.debt);
  const userDebtsTwo = deepCopy(reqBody.debt);

  const newCalculator = await Calculator.create({
    user_id: userId,
    calculator_name: "DEBT",
  });

  // Assign values to other fields if needed
  newCalculator.created_at = new Date();
  newCalculator.updated_at = new Date();

  // const monthlyHouseholdIncome = reqBody.monthlyHouseholdIncome
  //   ? Number(reqBody.monthlyHouseholdIncome)
  //   : 0;
  const additionalPayment = reqBody.additionalPayment
    ? Number(reqBody.additionalPayment)
    : 0;

  //   // Function to handle invalid or missing monthlyHouseholdIncome
  // function getValidMonthlyIncome(income) {
  //   return income && !isNaN(income) && income > 0 ? Number(income) : 0;
  // }

  // const monthlyHouseholdIncome = getValidMonthlyIncome(reqBody.monthlyHouseholdIncome);

  // Format Dates
  function formatDateToMonthYear(date) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${month} ${year}`;
  }

  function calculateDebtFreeDateWithminimum(debts, accelerationCash) {
    // Step 1: Sort debts from smallest to largest balance
    debts.sort((a, b) => a.balanceOwed - b.balanceOwed);

    let totalDebt = 0;
    let months = 0;

    let totalMinimumPayment = 0;
    debts.forEach((debt) => {
      totalMinimumPayment += debt.minimumPayment;
    });

    let totalDebtOutput = debts.reduce(
      (total, debt) => total + debt.balanceOwed,
      0
    );

    const debtInfoArray = debts.map((debt) => ({
      debtType: debt.debtType,
      balanceOwed: debt.balanceOwed,
    }));

    // Step 4: Loop until all debts are paid off
    while (debts.length > 0) {
      // Step 2: Make minimum payments on all debts except the smallest
      debts.slice(1).forEach((debt) => {
        debt.balanceOwed -= debt.minimumPayment;
      });

      // Step 3: Pay as much as possible on the smallest debt
      const extraPayment = Math.min(
        accelerationCash + debts[0].minimumPayment,
        debts[0].balanceOwed
      );
      debts[0].balanceOwed -= extraPayment;

      // Check if the smallest debt is paid off
      if (debts[0].balanceOwed <= 0) {
        accelerationCash += debts[0].minimumPayment;
        debts.shift(); // Remove the paid off debt
      } else {
        // Move the smallest debt to its correct position after payment
        let i = 1;
        while (
          i < debts.length &&
          debts[i].balanceOwed < debts[i - 1].balanceOwed
        ) {
          const temp = debts[i];
          debts[i] = debts[i - 1];
          debts[i - 1] = temp;
          i++;
        }
      }

      // Increment months
      months++;
    }

    // Calculate years and months
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    // Calculate debt free date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    console.log(months);

    const totalMonths = currentMonth + months;
    const debtFreeYear = currentYear + Math.floor(totalMonths / 12);
    const debtFreeMonth = totalMonths % 12;

    console.log(debtFreeMonth);
    // Map month index to month name
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const debtFreeMonthName = monthNames[debtFreeMonth % 12];

    return {
      totalDebt: totalDebtOutput,
      years,
      remainingMonths,
      debtFreeYear,
      debtFreeMonth,
      debtFreeMonthName,
      totalMinimumPayment,
      debtInfo: debtInfoArray,
    };
  }

  // Calculate the debt-free dates for all debts with additional payment
  function calculateDebtFreeDate(debts, accelerationCash) {
    // Step 1: Sort debts from smallest to largest balance
    debts.sort((a, b) => a.balanceOwed - b.balanceOwed);

    let totalDebt = 0;
    let months = 0;

    let totalMinimumPayment = 0;
    debts.forEach((debt) => {
      totalMinimumPayment += debt.minimumPayment;
    });

    let totalDebtOutput = debts.reduce(
      (total, debt) => total + debt.balanceOwed,
      0
    );

    const debtInfoArray = debts.map((debt) => ({
      debtType: debt.debtType,
      balanceOwed: debt.balanceOwed,
    }));
    console.log(debtInfoArray);

    // Step 4: Loop until all debts are paid off
    while (debts.length > 0) {
      // Step 2: Make minimum payments on all debts except the smallest
      debts.slice(1).forEach((debt) => {
        debt.balanceOwed -= debt.minimumPayment;
      });

      // Step 3: Pay as much as possible on the smallest debt
      const extraPayment = Math.min(
        accelerationCash + debts[0].minimumPayment,
        debts[0].balanceOwed
      );
      debts[0].balanceOwed -= extraPayment;

      // Check if the smallest debt is paid off
      if (debts[0].balanceOwed <= 0) {
        accelerationCash += debts[0].minimumPayment;
        debts.shift(); // Remove the paid off debt
      } else {
        // Move the smallest debt to its correct position after payment
        let i = 1;
        while (
          i < debts.length &&
          debts[i].balanceOwed < debts[i - 1].balanceOwed
        ) {
          const temp = debts[i];
          debts[i] = debts[i - 1];
          debts[i - 1] = temp;
          i++;
        }
      }

      // Increment months
      months++;
    }

    // Calculate years and months
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    // Calculate debt free date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    console.log(months);

    const totalMonths = currentMonth + months;
    const debtFreeYear = currentYear + Math.floor(totalMonths / 12);
    const debtFreeMonth = totalMonths % 12;

    console.log(debtFreeMonth);
    // Map month index to month name
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const debtFreeMonthName = monthNames[debtFreeMonth % 12];

    return {
      totalDebt: totalDebtOutput,
      years,
      remainingMonths,
      debtFreeYear,
      debtFreeMonth,
      debtFreeMonthName,
      totalMinimumPayment,
      debtInfo: debtInfoArray,
    };
  }

  console.log(userDebtsTwo);
  const debtFreeDates = calculateDebtFreeDate(userDebts, additionalPayment);
  console.log(userDebtsTwo);
  const debtFreeDatesWithMinimum = calculateDebtFreeDateWithminimum(
    userDebtsTwo,
    0
  );

  let percIncome;

  // if (monthlyHouseholdIncome === 0) {
  //   percIncome = "No Monthly Income Provided";
  // } else {
  //   console.log(debtFreeDates.totalMinimumPayment);
  //   console.log(debtFreeDates.totalDebt);

  //   percIncome = Number(
  //     (debtFreeDates.totalMinimumPayment / monthlyHouseholdIncome) * 100
  //   ).toFixed(2);
  // }

  const monthsToTerminate =
    debtFreeDates.years * 12 + debtFreeDates.remainingMonths;

  await pushDataToCalculatorDetailsForDebt(newCalculator.id, reqBody);

  // Prepare the response object
  const response = {
    // code: 200,
    calculatorType: "DEBT",
    calculatorOutput: {
      totalDebt: debtFreeDates.totalDebt,
      freeIn: `${debtFreeDates.years} years & ${debtFreeDates.remainingMonths} months`,
      debtFreeDateWithMinimum: `${debtFreeDatesWithMinimum.debtFreeMonthName} ${debtFreeDatesWithMinimum.debtFreeYear}`,
      debtFreeDateWithAdditional: `${debtFreeDates.debtFreeMonthName} ${debtFreeDates.debtFreeYear}`,
      // percentIncome: percIncome,
      monthsToTerminate: monthsToTerminate,
      monthlyEMI: debtFreeDates.monthlyEMIPayment,
      debtInfo: debtFreeDates.debtInfo.map((debt) => ({
        debtType: debt.debtType,
        balanceOwed: debt.balanceOwed,
      })),
    },
  };
  await pushDataToCalculatorHistory(response, userId);
  await CalculatorOutput.create({
    user_id: userId,
    history: response,
    calculator_type: "DEBT",
  });

  return response;
};

//budget calculator
const budgetCalculator = async (reqBody, userId) => {
  //Calculator Entry
  const newCalculator = await Calculator.create({
    user_id: userId,
    calculator_name: "BUDGET",
  });

  // Assign values to other fields if needed
  newCalculator.created_at = new Date();
  newCalculator.updated_at = new Date();

  const monthlyIncome = Number(reqBody.monthlyIncome);
  const otherIncome = Number(reqBody.otherIncome);
  const monthlyExpenses = calculateTotalExpenses(reqBody);

  const netIncome = monthlyIncome + otherIncome - monthlyExpenses;

  await pushDataToCalculatorDetails(newCalculator.id, reqBody);

  const response = {
    calculatorType: CalculatorType.BUDGET,
    calculatorOutput: {
      monthlyIncome: monthlyIncome + otherIncome,
      monthlyExpenses,
      netIncome,
    },
  };
  await pushDataToCalculatorHistory(response, userId);
  await CalculatorOutput.create({
    user_id: userId,
    history: response,
    calculator_type: "BUDGET",
  });

  // Function to calculate total expenses
  function calculateTotalExpenses(expenses) {
    let totalExpenses = 0;
    for (const key in expenses) {
      if (
        expenses.hasOwnProperty(key) &&
        key !== "calculatorType" &&
        key !== "monthlyIncome" &&
        key !== "otherIncome" &&
        key !== "userId" &&
        key !== "id"
      ) {
        totalExpenses += Number(expenses[key]);
      }
    }
    return totalExpenses;
  }

  return response;
};

//get history by Id
const getHistory = async (userId) => {
  const calculatorType = "SAVINGS";

  const history = await CalculatorHistory.findOne({
    // where: { user_id: userId },

    where: sequelize.where(
      sequelize.literal(`JSON_EXTRACT(history, '$.calculatorType')`),
      calculatorType
    ),
  });
  if (!history) {
    // throw new ApiError(httpStatus.OK, "History Not Found For this User","hi");
    return [];
  }
  return history.history;
};

// where: sequelize.literal("history"->>'calculator_type' = :calculatorType),  replacements: { calculatorType },

const getHistoryByCalculatorType = async (userId, calculatorType) => {
  const where = { [Op.and]: {} };
  if (calculatorType && calculatorType !== undefined && calculatorType !== "")
    where[Op.and]["calculator_type"] = calculatorType;
  // if (calculatorType && calculatorType !== undefined && calculatorType !== "")
    where[Op.and]["user_id"] = userId;

  let calculatorHistories = await CalculatorOutput.findAll({
    attributes: ["history"],
    where: where,
    limit: 7,
    order: [["id", "DESC"]],
    raw: true,
  });

  calculatorHistories= calculatorHistories.map((item) => JSON.parse(item.history));
  const output_data = {};

  calculatorHistories.forEach((item) => {
    const calculatorType = item.calculatorType;
    if (!output_data[calculatorType]) {
      output_data[calculatorType] = [];
    }
    output_data[calculatorType].push(item);
  });


  return output_data;
};

const getHistoryByCalculatorType1 = async (userId, calculatorType) => {
  const where = {};

  if (calculatorType && calculatorType !== undefined && calculatorType !== "") {
    where["calculator_type"] = calculatorType;
  }

  where["user_id"] = userId;

  let calculatorHistories = await CalculatorOutput.findAll({
    attributes: ["history"],
    where: where,
    limit: 7,
    order: [["id", "DESC"]],
    raw: true,
  });

  calculatorHistories = calculatorHistories.map((item) => JSON.parse(item.history));

  const output_data = {
    [calculatorType]: [],
  };

  calculatorHistories.forEach((item) => {
    output_data[calculatorType].push(item.calculatorOutput);
  });

  return { code: 200, data: output_data };
};



module.exports = {
  mortgageCalculator,
  savingsCalculator,
  debtCalculator,
  budgetCalculator,
  getHistory,
  getHistoryByCalculatorType,
  getHistoryByCalculatorType1
};
