const express = require('express');
import paymentController from  '../controller/paymentController'
import authController from '../controller/authController'

const router = express.Router();

router.use(authController.protect);

router.post('/checkout-session/:tourId', paymentController.getCheckoutSession);
router.post('/confirm-payment', paymentController.confirmPayment);

// Admin-specific routes for managing payments (if any)
router.use(authController.restrictTo('admin'));
module.exports = router;