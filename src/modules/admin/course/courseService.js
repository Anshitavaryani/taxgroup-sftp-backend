const { Sequelize, QueryTypes, where } = require("sequelize");
const { sequelize } = require("../../../config/db");
const { tokenTypes } = require("../../../config/token");
const ApiError = require("../../../utils/ApiError");
const tokenService = require("../../../commonServices/tokenService");
const {
  Admin,
  Course,
  studentReviews,
  courseInclude,
  courseSection,
  sectionDetails,
  courseWatchlist,
  userProgress,
} = require("../../../models");
const httpStatus = require("http-status");

//admin creates course
const createCourse = async (filter, options) => {
  const courseObj = {
    course_name: filter.course_name || null,
    course_pic: filter.images || null,
    difficulty_level: filter.difficulty_level || null,
    language: filter.language || null,
    instructor_name: filter.instructor_name || null,
    is_best_course: 0,
    course_brief_description: filter.course_brief_description || null,
    course_description: filter.course_description || null,
    course_rating: null, // Initialize course_rating as null
    rating_in_numbers: null, // Initialize rating_in_numbers as null
  };

  const course = await Course.create(courseObj);

  if (!course) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }

  // // Find all student reviews for the course
  // const reviews = await studentReviews.findAll({ course_id: course._id });

  // if (reviews.length > 0) {
  //   // Calculate the average rating from all reviews
  //   const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  //   const averageRating = totalRating / reviews.length;

  //   // Update the course object with the calculated average rating and rating_in_numbers
  //   course.course_rating = averageRating;
  //   course.rating_in_numbers = reviews.length;
  //   await course.save(); // Save the updated course object
  // }

  return course;
};

//upload course include
const createCoursInclude = async (id, course_id, course_outline) => {
  const AdminDoc = await Admin.findOne({ where: { id: id } });
  if (!AdminDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Admin not found");
  }
  const CourseDoc = await Course.findOne({ where: { id: course_id } });
  if (!CourseDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Course not found");
  }
  const courseIncludeObj = {
    course_outline: course_outline,
    course_id: course_id,
  };

  const coursIncludeDoc = await courseInclude.create(courseIncludeObj, {
    where: { course_id: course_id },
  });
  if (!coursIncludeDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }
  return coursIncludeDoc;
};

//create section for course
const createCourseSection = async (
  id,
  course_id,
  section_id,
  section_heading,
  lecture_count,
  total_duration
) => {
  const AdminDoc = await Admin.findOne({ where: { id: id } });
  if (!AdminDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Admin not found");
  }
  const CourseDoc = await Course.findOne({ where: { id: course_id } });
  if (!CourseDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Course not found");
  }
  const courseSectionObj = {
    course_id: course_id,
    section_id: section_id,
    section_heading: section_heading,
    lecture_count: lecture_count,
    total_duration: total_duration,
  };

  const courseSectionDoc = await courseSection.create(courseSectionObj);
  if (!courseSectionDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }
  return courseSectionDoc;
};

//create Lecture
const createSectionDetails = async (
  id,
  course_id,
  section_id,
  content_name,
  content_data,
  content_type,
  content_duration
) => {
  const AdminDoc = await Admin.findOne({ where: { id: id } });
  if (!AdminDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Admin not found");
  }

  const existingSectionDoc = await courseSection.findOne({
    where: { course_id: course_id, section_id: section_id },
  });

  if (!existingSectionDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Section and course not found");
  }

  const courseSectionObj = {
    course_id: course_id,
    section_id: section_id,
    content_name: content_name,
    content_data: content_data,
    content_type: String(content_type),
    content_duration: content_duration,
  };

  const courseSectionDoc = await sectionDetails.create(courseSectionObj);

  if (!courseSectionDoc) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Failed to create section details"
    );
  }

  return courseSectionDoc;
};

// Update course by ID
const updateCourse = async (course_id, updateFields) => {
  // Find the course by ID
  const course = await Course.findOne({ where: { id: course_id } });
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const updateObj = {
    course_name: updateFields.course_name || null,
    course_pic: updateFields.images || null,
    difficulty_level: updateFields.difficulty_level || null,
    language: updateFields.language || null,
    instructor_name: updateFields.instructor_name || null,
    course_brief_description: updateFields.course_brief_description || null,
    course_description: updateFields.course_description || null,
  };

  // Update the course fields with provided updateFields
  Object.assign(course, updateObj);

  // Save the updated course
  await course.save();

  return course;
};

// Update course include by ID
const updateCourseInclude = async (course_include_id, updateFields) => {
  // Find the course include by ID
  console.log("ID: " + course_include_id);
  const courseIncludeVar = await courseInclude.findOne({
    where: { id: course_include_id },
  });
  if (!courseIncludeVar) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course include not found");
  }

  const updateObj = {
    course_outline:
      updateFields.course_outline || courseIncludeVar.course_outline,
    icons: updateFields.images || courseIncludeVar.icons,
  };

  // Update the course include fields with provided updateFields
  Object.assign(courseIncludeVar, updateObj);

  // Save the updated course include
  await courseIncludeVar.save();

  return courseIncludeVar;
};

// Update course section by ID
const updateCourseSection = async (section_id, updateFields) => {
  // Find the course section by ID
  const section = await courseSection.findOne({ where: { id: section_id } });
  if (!section) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course section not found");
  }

  const updateObj = {
    section_heading: updateFields.section_heading || section.section_heading,
  };

  // Update the course section fields with provided updateFields
  Object.assign(section, updateObj);

  // Save the updated course section
  await section.save();

  return section;
};

// Update section details by ID
const updateSectionDetails = async (section_detail_id, updateFields) => {
  // Find the section details by ID
  const sectionDetailsVar = await sectionDetails.findOne({
    where: { id: section_detail_id },
  });

  if (!sectionDetailsVar) {
    throw new ApiError(httpStatus.NOT_FOUND, "Section details not found");
  }

  const updateObj = {
    content_name: updateFields.content_name || sectionDetailsVar.content_name,
    content_data: updateFields.content_data || sectionDetailsVar.content_data,
    content_type: updateFields.content_type || sectionDetailsVar.content_type,
  };

  // Update the section details fields with provided updateFields
  Object.assign(sectionDetailsVar, updateObj);

  // Save the updated section details
  await sectionDetailsVar.save();

  return sectionDetailsVar;
};

// Delete course by ID
const deleteCourse = async (course_id) => {
  // Find the course by ID
  const course = await Course.findOne({ where: { id: course_id } });
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  // Delete all associated student reviews for the course
  await studentReviews.destroy({ where: { course_id: course_id } });

  // Delete all course includes for the course
  await courseInclude.destroy({ where: { course_id: course_id } });

  // Delete all course sections for the course
  await courseSection.destroy({ where: { course_id: course_id } });

  // Delete all lectures for the course
  await sectionDetails.destroy({ where: { course_id: course_id } });

  // Delete all watchlistfor the course
  await courseWatchlist.destroy({ where: { course_id: course_id } });

  // Delete all progress for the course of any user
  await userProgress.destroy({ where: { course_id: course_id } });

  // Finally, delete the course itself
  const deletedCourse = await Course.destroy({ where: { id: course_id } });
  if (deletedCourse !== 1) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Course deletion failed"
    );
  }

  return { message: "Course deleted successfully" };
};

// Delete course include by ID
const deleteCourseInclude = async (course_include_id) => {
  // Find the course include by ID
  const courseIncludeDel = await courseInclude.findOne({
    where: { id: course_include_id },
  });

  if (!courseIncludeDel) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course include not found");
  }

  // Delete the course include
  const deletedCourseInclude = await courseInclude.destroy({
    where: { id: course_include_id },
  });

  if (deletedCourseInclude !== 1) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Course include deletion failed"
    );
  }

  return { message: "Course include deleted successfully" };
};

// Delete course section by ID
const deleteCourseSection = async (section_id) => {
  // Find the course section by ID
  const section = await courseSection.findOne({ where: { id: section_id } });
  if (!section) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course section not found");
  }

  // Delete all section details associated with the course section
  await sectionDetails.destroy({ where: { section_id: section_id } });

  // Finally, delete the course section itself
  const deletedSection = await courseSection.destroy({
    where: { id: section_id },
  });
  if (deletedSection !== 1) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Course section deletion failed"
    );
  }

  return { message: "Course section deleted successfully" };
};

module.exports = {
  createCourse,
  createCoursInclude,
  createCourseSection,
  createSectionDetails,
  deleteCourse,
  updateCourse,
  updateCourseSection,
  updateCourseInclude,
  updateSectionDetails,
  deleteCourseInclude,
  deleteCourseSection,
};
