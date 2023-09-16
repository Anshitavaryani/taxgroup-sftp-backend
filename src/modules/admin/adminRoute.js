const express = require('express');
const router = express.Router();
const adminController = require("../admin/adminAuth/adminController")
const forumController = require("./forum/forumController")
const courseController = require("../admin/course/courseController")
const userController = require('./user/userController')
const {validateSignInRequestBodyAdmin,verifySuperAdminToken} = require("./adminAuth/adminMiddleware");
const { validateEditUser } = require('../../middlewares/adminuser');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Set the destination where you want to store the uploaded images.
      // For example, './uploads/' directory in your project.
      cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
      // You can customize the filename if needed. Here, we keep the original filename.
      cb(null, file.originalname);
    },
  });
const upload = multer({ storage: storage });

router.post('/createAdmin',adminController.createAdmin);
router.post('/login',[validateSignInRequestBodyAdmin],adminController.adminLogin);
router.get('/getAllAdminUser',adminController.getAllAdminUser);
router.post('/editAdminUser',[verifySuperAdminToken],adminController.editAdminUser);
router.post('/deleteAdminUser',[verifySuperAdminToken],adminController.deleteAdminUser);
router.post('/createPermision',[verifySuperAdminToken],adminController.createAndUpdatePermissions);
router.post('/getadminProfile',adminController.getAdminProfileByRefreshToken);
router.post('/editAdminProfile',[verifySuperAdminToken],adminController.editAdminProfile);
router.post('/otp',adminController.sendVerificationOTP);
router.post('/forgetPassword',[verifySuperAdminToken],adminController.forgetPassword);
router.post('/changePassword',[verifySuperAdminToken],adminController.changePassword);


//forum apis
router.get('/getAllQuestions',forumController.getAllQuestions)
router.get('/getQuestionById',forumController.getQuestionById)
router.post('/postAnswer',[verifySuperAdminToken],forumController.postAnswer)
router.post('/updateAnswer',[verifySuperAdminToken],forumController.updateAnswer)
router.post('/deleteQuestion',[verifySuperAdminToken],forumController.deleteQuestion)

//courses api
router.post('/createCourse',[verifySuperAdminToken],courseController.createCourse)
router.post('/createCourseInclude',[verifySuperAdminToken],courseController.createCoursInclude)
router.post('/createCourseSection',[verifySuperAdminToken],courseController.createCourseSection)
router.post('/createSectionDetails',[verifySuperAdminToken],courseController.createSectionDetails)
router.put('/updateCourse/:course_id',[verifySuperAdminToken],courseController.updateCourse)
router.patch('/updateCourseInclude/:course_include_id',[verifySuperAdminToken],courseController.updateCourseInclude)
router.put("/updateCourseSection/:section_id",[verifySuperAdminToken],courseController.updateCourseSection)
router.put('/updateSectionDetails/:section_detail_id',[verifySuperAdminToken],courseController.updateSectionDetails)
router.delete('/deleteCourse/:course_id',[verifySuperAdminToken],courseController.deleteCourse)
router.delete('/deleteCourseInclude/:course_include_id',[verifySuperAdminToken],courseController.deleteCourseInclude)
router.delete('/deleteCourseSection/:section_id',[verifySuperAdminToken],courseController.deleteCourseSection)

//user api
router.get('/getAllUsers',userController.getAllUsers)
router.get('/getUserById', userController.getUserById)
router.delete('/deleteUser',[verifySuperAdminToken], userController.deleteUser)
router.put('/editUser',[verifySuperAdminToken], userController.editUser)
router.put('/changeUserStatus', [verifySuperAdminToken], userController.changeUserStatus)

module.exports = router;