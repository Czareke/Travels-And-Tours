const express = require('express');
const authController = require('../controller/authController');
const userController = require('../controller/userController');


const router=express.Router()
router.post('/register',authController.createUser)
router.post('/login',authController.login)
router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:token',authController.resetPassword)
router.use(authController.protect)//authentication middleware
router.patch('/updateMyPassword',authController.updatePassword)
router.post('/updateMe',authController.updateMe)
router.delete('/deleteMe',authController.deleteMe)

module.exports= router;