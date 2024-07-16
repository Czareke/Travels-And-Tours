import Booking from '../Models/bookingModel'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'
import Tour from '../Models/TourModel'

// @   Create a new booking
exports.createBooking = catchAsync(async(req,res,next)=>{
    const tour = await Tour.findById(req.params.tourId)
    if(!tour){
        return next(new AppError('No tour found with that ID',404))
    }
    const booking = new Booking(req.body)
    booking.tour = tour
    booking.user = req.user._id
    await booking.save()
    res.status(201).json({
        status:'success',
        data:booking
    })
})
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
        bookings
    }
    });
});
exports.getOneBooking=catchAsync(async(req,res,next)=>{
    const booking = await Booking.findById(req.params.id).populate('tour')
    if(!booking){
        return next(new AppError('No booking found with that ID',404))
    }
    res.status(200).json({
        status:'success',
        data:booking
    })
})

exports.createBookings = catchAsync(async (req, res, next) => {
    const tourIds = req.body.tourIds; 
    // Find all tours matching the given IDs
    const tours = await Tour.find({ _id: { $in: tourIds } });
    
    // Check if any tours were found
    if (!tours.length) {
        return next(new AppError('No tours found with those IDs', 404));
    }
    // Map the found tours to new Booking objects
    const newBookings = tours.map(tour => ({
        tour: tour._id,
        user: req.user._id
    }));
    // Insert multiple booking documents at once
    const bookings = await Booking.insertMany(newBookings);
    // Respond with the created bookings
    res.status(201).json({
        status: 'success',
        data: {
        bookings
    }
    });
});
exports.updateBookings=catchAsync(async(req,res,next)=>{
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if(!booking){
        return next(new AppError('No booking found with that ID',404))
    }
    res.status(200).json({
        status:'success',
        data:booking
    })
})
exports.deleteBooking=catchAsync(async(req,res,next)=>{
    const booking = await Booking.findByIdAndDelete(req.params.id)
    if(!booking){
        return next(new AppError('No booking found with that ID',404))
    }
    res.status(204).json({
        status:'success',
        data:null,
        message:'Booking deleted successfully'
    })
})