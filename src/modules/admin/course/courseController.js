const httpStatus = require("http-status");

const catchAsync = require("../../../utils/catchAsync");
const ApiError = require("../../../utils/ApiError");
const tokenService = require("../../../commonServices/tokenService");
const pick = require("../../../utils/pick");

const coursesService = require("./courseService");

//admin createcourse
const createCourse = catchAsync(async (req, res) => {
  const filter = pick(req.body, [
    "id",
    "course_name",
    "images",
    "difficulty_level",
    "language",
    "instructor_name",
    "course_brief_description",
    "course_description",
  ]);
  const options = pick(req.body, ["sortBy", "limit", "page"]);
  const admin = await coursesService.createCourse(filter, options);
  if (!admin) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to create course"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    message: "Succssfully Created course",
    course_id: admin.id,
  });
});

//upload course include
const createCoursInclude = catchAsync(async (req, res) => {
  const courseInclude = await coursesService.createCoursInclude(
    req.body.id,
    req.body.course_id,
    req.body.course_outline,
  );
  if (!courseInclude) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Create course Include"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: courseInclude,
    message: "Succssfully created course Include",
  });
});

//create course section
const createCourseSection = catchAsync(async (req, res) => {
  const courseInclude = await coursesService.createCourseSection(
    req.body.id,
    req.body.course_id,
    req.body.section_id,
    req.body.section_heading,
    req.body.lecture_count,
    req.body.total_duration
  );
  if (!courseInclude) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Create course Include"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: courseInclude,
    message: "Succssfully created course Include",
  });
});

// Update course section by ID
const updateCourseSection = catchAsync(async (req, res) => {
  const { section_id } = req.params;

  const updateFields = pick(req.body, ["section_heading"]);

  const updatedSection = await coursesService.updateCourseSection(
    section_id,
    updateFields
  );

  if (!updatedSection) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course section not found");
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: updatedSection,
    message: "Course section updated successfully",
  });
});

//create course section details
const createSectionDetails = catchAsync(async (req, res) => {
  const courseInclude = await coursesService.createSectionDetails(
    req.body.id,
    req.body.course_id,
    req.body.section_id,
    req.body.content_name,
    req.body.content_data,
    req.body.content_type,
    req.body.content_duration
  );
  if (!courseInclude) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to Create course Include"
    );
  }
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: courseInclude,
    message: "Succssfully created a new lecture",
  });
});

// Update course by ID
const updateCourse = catchAsync(async (req, res) => {
  const { course_id } = req.params;

  const updateFields = pick(req.body, [
    "course_name",
    "images",
    "difficulty_level",
    "language",
    "instructor_name",
    "course_brief_description",
    "course_description",
  ]);

  const updatedCourse = await coursesService.updateCourse(
    course_id,
    updateFields
  );

  if (!updatedCourse) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: updatedCourse,
    message: "Course updated successfully",
  });
});

// Update course include by ID
const updateCourseInclude = catchAsync(async (req, res) => {
  const { course_include_id } = req.params;

  const updateFields = pick(req.body, ["course_outline", "images"]);

  const updatedCourseInclude = await coursesService.updateCourseInclude(
    course_include_id,
    updateFields
  );

  if (!updatedCourseInclude) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course include not found");
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: updatedCourseInclude,
    message: "Course include updated successfully",
  });
});

// Update section details by ID
const updateSectionDetails = catchAsync(async (req, res) => {
  const { section_detail_id } = req.params;

  const updateFields = pick(req.body, [
    "content_name",
    "content_data",
    "content_type",
  ]);

  const updatedSectionDetails = await coursesService.updateSectionDetails(
    section_detail_id,
    updateFields
  );

  if (!updatedSectionDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "Section details not found");
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: updatedSectionDetails,
    message: "Section details updated successfully",
  });
});

// Delete course by ID
const deleteCourse = catchAsync(async (req, res) => {
  const { course_id } = req.params;

  const result = await coursesService.deleteCourse(course_id);

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: result,
    message: "Course deleted successfully",
  });
});

// Delete course include by ID
const deleteCourseInclude = catchAsync(async (req, res) => {
  const { course_include_id } = req.params;

  const result = await coursesService.deleteCourseInclude(course_include_id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course include not found");
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: result,
    message: "Course include deleted successfully",
  });
});

// Delete course section by ID
const deleteCourseSection = catchAsync(async (req, res) => {
  const { section_id } = req.params;

  const result = await coursesService.deleteCourseSection(section_id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course section not found");
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: result,
    message: "Course section deleted successfully",
  });
});

module.exports = {
  createCourse,
  createCoursInclude,
  createCourseSection,
  createSectionDetails,
  deleteCourse,
  updateCourse,
  updateCourseInclude,
  deleteCourseInclude,
  updateCourseSection,
  deleteCourseSection,
  updateSectionDetails,
};
