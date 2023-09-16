const express = require("express");
const router = express.Router();
const courseController = require("./courseController");
const {verifyUserToken} = require("../user/userMiddleware");
const { courseSection } = require("../../models");


// router.post('/test',courseController.test);
router.get('/getCourses',courseController.getCourses)
router.get('/getCourseById',[verifyUserToken],courseController.getCoursesById)
router.post('/postReviewAndRAating',[verifyUserToken],courseController.postReviewAndRating)
router.post('/addCourseToWatchList',[verifyUserToken],courseController.addCourseToWatchlist)
router.post('/getCourseContentByCourseId',courseController.getCourseContentByCourseId)
router.post('/getSectionContentBySectionId',[verifyUserToken],courseController.getSectionContentBySectionId)
router.get('/getWatchList',[verifyUserToken],courseController.getWatchedListByUserId)
router.post('/getAllReviewsAndRatngs',[verifyUserToken],courseController.getReviewsAndRatings)
router.post('/getReviewsAndRatingByUserId',[verifyUserToken],courseController.getReviewsAndRatingByUserId)
router.post('/editReviewAndRating',[verifyUserToken],courseController.updateReviewsAndRatings)
router.post('/deleteReviewAndRating',[verifyUserToken],courseController.deleteReviewAndRating)
router.post('/userProgress',[verifyUserToken],courseController.postUserProgress)
router.get('/getLatestSectionID/:course_id',courseController.getLatestSectionIdForCourse)
router.post('/getCertificate',[verifyUserToken],courseController.getCertificate)

module.exports = router;