import User from '../Models/userModel';
import catchAsync from '../utils/catchAsync';
import Booking from '../models/bookingModel';
import Tour from '../Models/tourModel';
import AppError from '../utils/appError';
//@ desc confirmPayment
exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { tourId } = req.body;

  const tour = await Tour.findByID(tourId);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  const amount = tour.amount;
});
