import User from '../Models/userModel';
import catchAsync from '../utils/catchAsync';
import Booking from '../Models/BookingModel';
import Tour from '../Models/tourModel';
import AppError from '../utils/appError';
//@ desc confirmPayment
exports.confirmPayment = catchAsync(async (req, res, next) => {
    const { tourId } = req.body;
    const tour = await Tour.findByID(tourId);
    if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
    }
    const amount = tour.price * 100
    const paymentIntent=await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method: payment_method_id,
        confirmation_method: 'manual',
        confirm: true,
        metadata: { tourId, userId: req.user._id },
    });
    if(paymentIntent.status !== 'succeeded'){
        return next(new AppError('Payment failed', 400));
    }
    const booking = await Booking.create({
        tour:tourId,
        user: req.user._id,
        price: tour.price
    })
    res.status(201).json({
        status:'success',
        data: {booking}
    });

});
