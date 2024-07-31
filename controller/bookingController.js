const Booking = require('../Models/BookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Tour = require('../Models/TourModel');
const notification = require('./notificationController');

// // @   Create a new booking
// exports.createBooking = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.tourId);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   // Create a new booking
//   const booking = new Booking({
//     ...req.body,
//     tour: tour._id,
//     user: req.user._id,
//   });
//   await booking.save();
//   res.status(201).json({
//     status: 'success',
//     data: {
//       booking,
//     },
//   });
// });
exports.getBookings = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const bookings = await Booking.find({ user: req.user._id })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});
exports.getOneBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('tour');
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: booking,
  });
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  const booking = new Booking({
    tour: tourId,
    user: req.user._id,
    price: tour.price,
  });

  await booking.save();

  // Send booking confirmation email and push notification
  await notificationController.sendBookingConfirmation(req.user, booking);
  await notificationController.sendPushNotification(req.user, 'Booking Confirmed', `Your booking for ${tour.name} has been confirmed.`);

  res.status(201).json({
    status: 'success',
    data: booking,
  });
});
exports.updateBookings = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: booking,
  });
});
// exports.deleteBooking = catchAsync(async (req, res, next) => {
//   const booking = await Booking.findByIdAndDelete(req.params.id);
//   if (!booking) {
//     return next(new AppError('No booking found with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//     message: 'Booking deleted successfully',
//   });
// });
exports.getBookingHistory=catchAsync(async(req,res,next)=>{
  const bookings=await Booking.find({user:req.user.id}).populate('tour')
  if(!bookings.length){
    return next(new AppError('No bookings found for this user',404))
  }
  res.status(200).json({
    status:'success',
    data:bookings,
    message:'Booking history fetched successfully'
  })
})
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }
  if (booking.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to cancel this booking', 403));
  }
  booking.status = 'cancelled';
  await booking.save();
  // Send booking cancellation email and push notification
  await notificationController.sendBookingCancellation(req.user, booking);
  await notificationController.sendPushNotification(req.user, 'Booking Cancelled', `Your booking for ${booking.tour.name} has been cancelled.`);
  res.status(200).json({
    status: 'success',
    data: booking,
  });
});
exports.updateBookingStatus=catchAsync(async(req,res,next)=>{
  const {status}=req.body
  if(![pending,confirmed,cancelled].includes(status)){
    return next(new AppError('Invalid booking status',400))
  }
  const booking=await Booking.findById(req.params.bookingId)
  if(!booking){
    return next(new AppError('No booking found with that ID',404))
  }
  booking.status=status
  await booking.save()
  res.status(200).json({
    status:'success',
    data:booking,
    message:`Booking status updated to ${status}`
  })
})