const express=require('express')
import userController from '../controller/userController'
import authController from '../controller/authController'

const router=express.Router()
router.
route('/user')
.get(userController.getAllUsers)
router.use(authController.protect)
router.use(authController.restrictTo("admin"));
router
.route('/user/:id')
.get(userController.getOneUser)
.patch(userController.updateMe)
.delete(userController.deleteMe)

module.exports=router