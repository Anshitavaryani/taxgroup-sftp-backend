const express = require("express");
const router = express.Router();
const calculatorController = require("./calculatorController");
const {verifyUserToken} = require("../user/userMiddleware");


router.post('/test',calculatorController.test);
router.post('/calculate',[verifyUserToken],calculatorController.calculate);
router.get('/getHistory',[verifyUserToken],calculatorController.getHistory);
router.get('/getHistoryByCalculatorType',[verifyUserToken],calculatorController.getHistoryByCalculatorType)
router.post('/getHistoryByCalculatorTypes',[verifyUserToken],calculatorController.getHistoryByCalculatorType1)

module.exports = router;