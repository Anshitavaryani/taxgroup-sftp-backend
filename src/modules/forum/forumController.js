const httpStatus = require("http-status");

const catchAsync = require("../../utils/catchAsync");
const ApiError = require("../../utils/ApiError");
const tokenService = require("../../commonServices/tokenService");
const pick = require("../../utils/pick");

const forumService = require("./forumService");

//post question api by user
const createQuestion = catchAsync(async (req, res) => {
  const Question = await forumService.createQuestion(
    req.body.id,
    req.body.question
  );
  if (!Question) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Create Question"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    // data: Question,
    message: "Succssfully created Question",
  });
});

//get all question
const getAllQuestions = catchAsync(async (req, res) => {
  const questions = await forumService.getAllQuestions(req.body.id);
  if (!questions) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to get questions"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: questions,
    message: "Succssfully get all questions",
  });
});

//get question by Id
const getQuestionById = catchAsync(async (req, res) => {
  const question = await forumService.getQuestionById(req.query.id);
  if (!question) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to get question"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: question,
    message: "Succssfully get question",
  });
});

//update question
const updateQuestion = catchAsync(async (req, res) => {
  const filter = pick(req.body, ["question_id", "question"]);

  const options = pick(req.body, ["sortBy", "limit", "page"]);

  const updatedQuestion = await forumService.updateQuestion(filter, options);

  if (!updatedQuestion) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Edit Question"
    );
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: updatedQuestion,
    message: "Successfully Edited Question",
  });
});

//delete question
const deleteQuestion = catchAsync(async (req, res) => {
  const question = await forumService.deleteQuestion(req.query.id);
  if (!question) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Delete question"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: question,
    message: "Succssfully Deleted question",
  });
});

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion
};
