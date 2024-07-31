const express = require('express')
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');


const router = express.Router()
router
.route('/tours')
.get(tourController.getAllTours)
.post(authController.protect,router.use(authController.restrictTo("admin")),tourController.CreateTour)
router
.route('/tours/:id')
.get(tourController.getOneTour)
.patch(authController.protect,router.use(authController.restrictTo("admin")),tourController.updateTour)
.delete(authController.protect,router.use(authController.restrictTo("admin")),tourController.deleteTour)

module.exports= router;