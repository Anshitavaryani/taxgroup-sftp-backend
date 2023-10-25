const express = require('express');
const router = express.Router();
const userController = require('./userController');
const contactFormController = require('../contactForm/contactFormController')

const {validateSignUpRequestBodyUser,validateSignInRequestBodyUser,verifyUserToken} = require('./userMiddleware')


router.post('/sendOTP', userController.sendVerificationOTP);
router.post('/verifyOTP',userController.verifyOTP);
router.post('/signUp',[validateSignUpRequestBodyUser],userController.registerUser);
router.post('/login',[validateSignInRequestBodyUser],userController.login);
router.post('/logout',userController.logout);
router.post('/refreshtoken',userController.refreshTokens);
router.get('/getUserProfile',[verifyUserToken],userController.getUserProfileByRefreshToken);
router.post('/updateUser',[verifyUserToken],userController.updateUser);
router.post('/forgetPassword',userController.forgetPassword);
router.post('/changePassword',[verifyUserToken],userController.changePassword)
router.get('/deleteAccount',[verifyUserToken],userController.deleteAccount)
router.post('/contactForm',contactFormController.createContactForm)


module.exports = router;
