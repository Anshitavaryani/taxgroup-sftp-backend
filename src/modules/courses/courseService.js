const { Sequelize, QueryTypes, where } = require("sequelize");
const moment = require("moment");
const ApiError = require("../../utils/ApiError");
const {
  Course,
  User,
  studentReviews,
  courseWatchlist,
  courseSection,
  courseInclude,
  sectionDetails,
  userProgress,
} = require("../../models");
const httpStatus = require("http-status");

//get allcourses
const getCourses = async () => {
  const result = await Course.findAll({
    where: { is_active: 1 },
  });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }
  return result;
};

//get course by  id
const getCoursesById = async (user_id,course_id) => {
  const result = await Course.findOne({
    where: { id: course_id, is_active: 1 },
    include: [
      {
        model: courseInclude,
        as: "course_include",
        required: false,
      },
      {
        model: courseSection,
        as: "course_section",
      },
      {
        model: courseWatchlist,
        as: "course_certificate",
        where:{user_id:user_id},
        required: false,
      },
    ],
  });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }
  return result;
};

//post review and ratings
const postReviewAndRating = async (user_id, course_id, review, rating) => {
  const UserDoc = await User.findOne({ where: { id: user_id } });
  if (!UserDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  const CourseDoc = await Course.findOne({ where: { id: course_id } });
  if (!CourseDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Course not found");
  }

  const existingReviewDoc = await studentReviews.findOne({
    where: { course_id: course_id, user_id: user_id },
  });

  if (existingReviewDoc) {
    // Update existing review
    const updatedReviewDoc = await studentReviews.update(
      { review: review, rating: rating, is_active: 1 },
      {
        where: { course_id: course_id, user_id: user_id },
      }
    );
    if (!updatedReviewDoc) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to update review");
    }
  } else {
    // Create new review
    const newReviewObj = {
      user_id: user_id,
      course_id: course_id,
      review: String(review),
      rating: rating,
      date: moment(),
      is_active: 1,
    };

    const createdReviewDoc = await studentReviews.create(newReviewObj);
    if (!createdReviewDoc) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create review");
    }
  }

  // Calculate average rating for the course and update it in the courses table
  const ratings = await studentReviews.findAll({
    where: { course_id: course_id, is_active: 1 },
    attributes: [
      [Sequelize.fn("AVG", Sequelize.col("rating")), "average_rating"],
    ],
    raw: true,
  });

  const averageRating = ratings[0].average_rating;
  await Course.update(
    { course_rating: averageRating },
    { where: { id: course_id } }
  );

  // Calculate the count of users who have rated the course and update it in the courses table
  const ratingCount = await studentReviews.count({
    where: { course_id: course_id, is_active: 1 },
  });

  await Course.update(
    { rating_in_numbers: ratingCount },
    { where: { id: course_id } }
  );

  // Update is_best_course attribute if conditions are met
  if (averageRating >= 4.5) {
    await Course.update({ is_best_course: 1 }, { where: { id: course_id } });
  } else if (averageRating < 4.5) {
    await Course.update({ is_best_course: 0 }, { where: { id: course_id } });
  }

  return { user_id, course_id, review, rating, date: moment() };
};

//add course to watchlist
const addCourseToWatchlist = async (userId, course_id) => {
  const UserDoc = await User.findOne({ where: { id: userId },attributes:['id'] });
  if (!UserDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  const CourseDoc = await Course.findOne({ where: { id: course_id } });
  if (!CourseDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Course not found");
  }

  // Check if the entry already exists
  const existingEntry = await courseWatchlist.findOne({
    where: { user_id: userId, course_id: course_id },
  });

  if (existingEntry) {
    return existingEntry;
  }

  // Create a new entry
  const newEntry = await courseWatchlist.create({
    user_id: userId,
    course_id: course_id,
  });

  return newEntry;
};

//get course contentby corse Id
const getCourseContentByCourseId = async (course_id) => {
  const result = await courseSection.findAll({
    where: { course_id: course_id },
    attributes: ["section_heading", "total_duration", "lecture_count"],
  });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }
  return result;
};

//get section content by section Id
const getSectionContentBySectionId = async (user_id,course_id, section_id) => {
  const result = await sectionDetails.findAll({
    where: { course_id: course_id, section_id: section_id },
    include: [
      {
        model: userProgress,
        as: "user_course_progress",
        required: false,
        where:{user_id:user_id}
      },
    ],
  });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }
  return result;
};

//get watchlist by userid
const getWatchedListByUserId = async (id) => {
  const result = await courseWatchlist.findAll({
    where: { user_id: id, certificate_provided: 0 },
    include: [
      {
        model: Course,
        as: "course_details",
        attributes: ["id", "course_name", "instructor_name", "course_pic"],
      },
      {
        model: studentReviews,
        as: "student_review",
        attributes: ["id", "user_id", "course_id", "rating", "review"],
        // where: { user_id: id },
        required: false,
      },
    ],
  });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }
  return result;
};

//get all reviewsand ratings
const getReviewsAndRatings = async (user_id, course_id) => {
  const UserDoc = await User.findOne({ where: { id: user_id } });
  if (!UserDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  const result = await studentReviews.findAll({
    where: { course_id: course_id, is_active: 1 },
    include: [
      {
        model: User,
        as: "user_details",
        attributes: ["id", "name", "profile_picture"],
      },
    ],
    order: [["user_id","DESC"]],
  });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }
  return result;
};

//getReview and ratings by useriD
const getReviewsAndRatingByUserId = async (user_id, course_id) => {
  console.log("user_id====>", user_id);
  const UserDoc = await User.findOne({ where: { id: user_id } });
  if (!UserDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  const result = await studentReviews.findOne({
    where: { course_id: course_id, is_active: 1 },
    // include: [
    //   {
    //     model: User,
    //     as: "user_details",
    //     attributes: ["id", "name"],
    //   },
    // ],
  });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }
  return result;
};

const getLatestSectionId = async (courseId) => {
  const sections = await courseSection.findAll({
    where: { course_id: courseId },
    order: [["section_id", "DESC"]],
    limit: 1,
  });

  if (sections.length === 0) {
    return null; // No sections found for the course
  }

  return sections[0].section_id;
};

//update review and rating
const updateReviewsAndRatings = async (filter, options) => {
  const course = await studentReviews.findOne({
    where: { course_id: filter.course_id, user_id: filter.id },
  });

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const reviewObj = {};
  if (
    typeof filter !== "undefined" &&
    filter.review !== "" &&
    typeof filter.review !== "undefined" &&
    filter.review !== course.review
  ) {
    reviewObj.review = filter.review;
  }
  if (
    typeof filter !== "undefined" &&
    filter.rating !== "" &&
    typeof filter.rating !== "undefined" &&
    filter.rating !== course.rating
  ) {
    reviewObj.rating = filter.rating;
  }

  // Set date field to updated_at value
  reviewObj.date = course.updated_at;

  let reviewDoc;
  if (Object.keys(reviewObj).length > 0) {
    reviewDoc = await studentReviews.update(reviewObj, {
      where: { course_id: filter.course_id, user_id: filter.id },
    });
  }

  const finalUpdatedReview = await studentReviews.findOne({
    where: { course_id: filter.course_id, user_id: filter.id },
  });

  if (!finalUpdatedReview) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Edit Review"
    );
  }

  return finalUpdatedReview;
};

//delete review
const deleteReviewAndRating = async (id, course_id) => {
  const review = await studentReviews.findByPk(course_id);
  if (!review) {
    throw new ApiError(httpStatus.BAD_REQUEST, "review not found");
  }
  await studentReviews.update(
    { is_active: "0" },
    { where: { course_id: course_id, user_id: id } }
  );
  const updatedReview = await studentReviews.findOne({
    where: { course_id: course_id, user_id: id },
  });
  return updatedReview;
};

// Function to update the certificate_provided column
// Function to update the certificate_provided column
const updateCertificateProvided = async (user_id, course_id) => {
  try {
    // Retrieve the total number of lectures for the course
    const course = await Course.findOne({ where: { id: course_id } });
    if (!course) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Course not found");
    }

    // Count the number of lectures seen by the user for the course
    const lecturesSeen = await userProgress.count({
      where: { user_id, course_id, is_completed: 1 },
    });

    // Check if the user has completed all the lectures
    if (lecturesSeen >= course.lectures) {
      // Update the certificate_provided column to 1 in the course_watchlist table
      await courseWatchlist.update(
        { certificate_provided: 1 },
        { where: { user_id, course_id } }
      );
    }
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to update certificate_provided"
    );
  }
};

//user progress
const postUserProgress = async (user_id, course_id, section_id, lecture_id) => {

  const UserDoc = await User.findOne({ where: { id: user_id } });
  if (!UserDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  console.log("userid=======>",user_id)
  const CourseDoc = await Course.findOne({ where: { id: course_id } });
  if (!CourseDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Course not found");
  }
  console.log("course_id=======>",course_id)
  const SectionDoc = await courseSection.findOne({ where: { id: section_id } });
  if (!SectionDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Section not found");
  }
  console.log("section_id=======>",section_id)
  const SectionDetailsDoc = await sectionDetails.findOne({
    where: { id: lecture_id },
  });
  if (!SectionDetailsDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Section Details not found");
  }

  // Check if the entry already exists
  const existingEntry = await userProgress.findOne({
    where: {
      user_id: user_id,
      course_id: course_id,
      section_id: section_id,
      lecture_id: lecture_id,
      is_completed: 1,
    },
  });

  if (existingEntry) {
    return existingEntry;
  }

  // Create a new entry
  const newEntry = await userProgress.create({
    user_id: user_id,
    course_id: course_id,
    section_id: section_id,
    lecture_id: lecture_id,
    is_completed: 1,
  });

  await updateCertificateProvided(user_id, course_id);

  return newEntry;
};

const getCertificate = async (user_id,course_id) => {
  const result = await courseWatchlist.findOne({
    where: {
      course_id: course_id,
      user_id:user_id,
      is_active: 1,
      certificate_provided: 1
    },
    include: [
      {
        model: User,
        as: "user_profile_details",
        attributes: ["id", "name", "profile_picture"],
      },
    ],
  });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }
  return result;
};

module.exports = {
  getCourses,
  getCoursesById,
  postReviewAndRating,
  addCourseToWatchlist,
  getCourseContentByCourseId,
  getSectionContentBySectionId,
  getWatchedListByUserId,
  getReviewsAndRatings,
  getReviewsAndRatingByUserId,
  updateReviewsAndRatings,
  deleteReviewAndRating,
  postUserProgress,
  getLatestSectionId,
  getCertificate,
};
