const express=require('express')
import authController from '../controller/authController'
import userController from '../controller/userController'

const router=express.Router()
router.post('/register',authController.createUser)
router.post('/login',authController.login)
router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:token',authController.resetPassword)
router.use(authController.protect)
router.get('/')