const { Sequelize, QueryTypes, where } = require("sequelize");
const { sequelize } = require("../../config/db");
const { tokenTypes } = require("../../config/token");
const ApiError = require("../../utils/ApiError");
const tokenService = require("../../commonServices/tokenService");
const { Forum, User } = require("../../models");

//create question api
const createQuestion = async (user_id, question) => {
  const userDoc = await User.findOne({ where: { id: user_id } });
  if (!userDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  const QuestionObj = {
    question: question,
    user_id: userDoc.id,
  };

  const QuestionDoc = await Forum.create(QuestionObj);
  if (!QuestionDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }

  return QuestionDoc;
};

//get all survey questions
const getAllQuestions = async (id) => {
  const result = await Forum.findAll({
    where: { is_active: 1, user_id: id },
  });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }
  return result;
};

//get survey question by Id
const getQuestionById = async (id) => {
  const result = await Forum.findOne({ where: { id: id } });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }
  return result;
};

//update question
const updateQuestion = async (filter, options) => {
  const updatedQuestion = await Forum.findOne({
    where: { id: filter["question_id"] },
  });

  if (!updatedQuestion) {
    throw new ApiError(httpStatus.NOT_FOUND, "Question not found");
  }

  const questionObj = {};
  if (
    typeof filter != "undefined" &&
    filter["question"] != "" &&
    typeof filter["question"] != "undefined" &&
    filter["question"] !== updatedQuestion["question"]
  ) {
    questionObj["question"] = filter["question"];
  }
  let questionDoc;
  if (Object.keys(questionObj).length > 0) {
    questionDoc = await updatedQuestion.update(questionObj);
  }
  const finalUpdatedQuestion = await Forum.findOne({
    where: { id: filter["question_id"] },
  });
  return finalUpdatedQuestion;
};

//delete question
const deleteQuestion = async (id) => {
  const question = await Forum.findByPk(id);
  if (!question) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Question not found");
  }
  await Forum.update({ is_active: "0" }, { where: { id: id } });
  const updatedQuestion = await Forum.findOne({ where: { id: id } });
  return updatedQuestion;
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
