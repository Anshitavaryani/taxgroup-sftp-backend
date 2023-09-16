const httpStatus = require("http-status");

const catchAsync = require("../../utils/catchAsync");
const ApiError = require("../../utils/ApiError");
const tokenService = require("../../commonServices/tokenService");
const pick = require("../../utils/pick");
const courseService = require("./courseService");

//get all admin user
const getCourses = catchAsync(async (req, res) => {
  const courses = await courseService.getCourses();
  if (!courses) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Get All Admin User"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: courses,
    message: "Successfully get all courses",
  });
});

//get courses by Id
const getCoursesById = catchAsync(async (req, res) => {
  const courses = await courseService.getCoursesById(req.body.id,parseInt(req.query.course_id));
  if (!courses) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to get course"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: courses,
    message: "Succssfully get courses",
  });
});

//post review and ratings
const postReviewAndRating = catchAsync(async (req, res) => {
  const course = await courseService.postReviewAndRating(
    req.body.id,
    req.body.course_id,
    req.body.review,
    req.body.rating
  );

  if (!course) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Unable to Create Course");
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: course,
    message: "Succssfully posted review and ratings",
  });
});

//add course to watchlist
const addCourseToWatchlist = catchAsync(async (req, res) => {
  const course = await courseService.addCourseToWatchlist(
    req.body.id,
    req.body.course_id
  );

  if (!course) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Unable to Add Course in watchlist"
    );
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: course,
    message: "Succssfully added in watchlist",
  });
});

//get course content by course Id
const getCourseContentByCourseId = catchAsync(async (req, res) => {
  const courses = await courseService.getCourseContentByCourseId(
    req.body.course_id
  );
  if (!courses) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Get all Course Content"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: courses,
    message: "Successfully get all course Content",
  });
});

//get section content by section Id
const getSectionContentBySectionId = catchAsync(async (req, res) => {
  const courses = await courseService.getSectionContentBySectionId(
    req.body.id,
    req.body.course_id,
    req.body.section_id
  );
  if (!courses) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Get All Section's Content "
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: courses,
    message: "Successfully got this Section's lectures",
  });
});

//get list of watchedcourses
const getWatchedListByUserId = catchAsync(async (req, res) => {
  const courses = await courseService.getWatchedListByUserId(req.body.id);
  if (!courses) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Get Watchlist"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: courses,
    message: "Successfully get Watchlist",
  });
});

//get all reiews and ratings
const getReviewsAndRatings = catchAsync(async (req, res) => {
  const courses = await courseService.getReviewsAndRatings(
    req.body.id,
    req.body.course_id
  );
  if (!courses) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Get All Reviews and Ratings"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: courses,
    message: "Successfully get All Reviews and Ratings",
  });
});

//get reviews and ratings by userId
const getReviewsAndRatingByUserId = catchAsync(async (req, res) => {
  const courses = await courseService.getReviewsAndRatingByUserId(
    req.body.id,
    req.body.course_id
  );
  if (!courses) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to get course"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: courses,
    message: "Succssfully get courses",
  });
});

//get latest section ID for a course
const getLatestSectionIdForCourse = catchAsync(async (req, res) => {
  const courseId = req.params.course_id; // Assuming the course ID is passed as a parameter
  const latestSectionId = await courseService.getLatestSectionId(courseId);
  if (!latestSectionId) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Get Latest Section ID"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: { latestSectionId },
    message: "Successfully get latest section ID",
  });
});


//update reviews
const updateReviewsAndRatings = catchAsync(async (req, res) => {
  // return res.send(req.body)
  const filter = pick(req.body, ["id","course_id", "review", "rating"]);

  const options = pick(req.body, ["sortBy", "limit", "page"]);

  const updatedReview = await courseService.updateReviewsAndRatings(
    filter,
    options
  );

  if (!updatedReview) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Edit Review"
    );
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: updatedReview,
    message: "Successfully Edited Review And rating",
  });
});

//delete review
const deleteReviewAndRating = catchAsync(async (req, res) => {
  const review = await courseService.deleteReviewAndRating(req.body.id,req.query.course_id);
  if (!review) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Delete Review & Rating "
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: review,
    message: "Succssfully Deleted Review & Rating ",
  });
});

//user progress
const postUserProgress = catchAsync(async (req, res) => {
  const course = await courseService.postUserProgress(
    req.body.id,
    req.body.course_id,
    req.body.section_id,
    req.body.lecture_id
  );

  if (!course) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Unable to Post progress"
    );
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: course,
    message: "Succssfully post progress",
  });
});

//get certificate of paticular course
const getCertificate = catchAsync(async (req, res) => {
  const courses = await courseService.getCertificate(req.body.id,req.body.course_id);
  if (!courses) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to get certificate"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: courses,
    message: "Succssfully get certificate",
  });
});

module.exports = {
  getCourses,
  getCoursesById,
  postReviewAndRating,
  getCourseContentByCourseId,
  getSectionContentBySectionId,
  addCourseToWatchlist,
  getWatchedListByUserId,
  getReviewsAndRatings,
  getReviewsAndRatingByUserId,
  updateReviewsAndRatings,
  deleteReviewAndRating,
  postUserProgress,
  getLatestSectionIdForCourse,
  getCertificate
};
