const express=require('express')
import bookingController from '../controller/bookingController'
import authController from '../controller/authController'

const router=express.Router()
router.use(authController.protect)
router
.route('/booking')
.post(bookingController.createBooking)
.get(bookingController.getBookingHistory)
//.get
router.route('/bookings')
.get(bookingController.getBookings)
router
.route('/bookings/:id')
.patch(bookingController.updateBookings)
.delete(bookingController.cancelBooking)

// router.route('/booking/:bookingId/payment')
router.route('/booking/:id')
.patch(bookingController.updateBookingStatus)

module.exports=router