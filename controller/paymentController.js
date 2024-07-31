const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../Models/BookingModel');
const Tour = require('../Models/TourModel');
const AppError = require('../utils/appError');

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

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
        {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          amount: tour.price * 100, // convert to cents
        currency: 'usd',
        quantity: 1
        }
    ]
    });
    // 3) Create session as response
    res.status(200).json({
    status: 'success',
    session
    });
});