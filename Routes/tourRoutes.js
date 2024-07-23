const express = require('express')
import tourController from '../controller/tourController'
import authController from '../controller/authController'

const router = express.Router()
router
.route('/tours')
.get(getAllTours)
.post(authController.protect,router.use(authController.restrictTo("admin")),tourController.CreateTour)
router
.route('/tours/:id')
.get(tourController.getOneTour)
.patch(authController.protect,router.use(authController.restrictTo("admin")),tourController.updateTour)
.delete(authController.protect,router.use(authController.restrictTo("admin")),tourController.deleteTour)

module.exports = router