import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import Tour from '../Models/TourModel';

// @desc     Get all tours
exports.getAllTours = catchAsync(async (req, res, next) => {
  const { search, destination, difficulty, sort } = req.query;

  // Build query object
  const queryObj = {};

  // Search by tour name or description
  if (search) {
    queryObj.$or = [
      { tourName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by destination
  if (destination) {
    queryObj.destination = destination;
  }

  // Filter by difficulty
  if (difficulty) {
    queryObj.difficulty = difficulty;
  }

  let result = Tour.find(queryObj);

  // Sorting
  if (sort === 'latest') {
    result = result.sort('-createdAt');
  } else if (sort === 'oldest') {
    result = result.sort('createdAt');
  } else if (sort === 'price-low-high') {
    result = result.sort('price');
  } else if (sort === 'price-high-low') {
    result = result.sort('-price');
  } else if (sort === 'name-a-z') {
    result = result.sort('tourName');
  } else if (sort === 'name-z-a') {
    result = result.sort('-tourName');
  }

  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(limit);

  const tours = await result;

  const totalTours = await Tour.countDocuments(queryObj);
  const numOfPages = Math.ceil(totalTours / limit);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    totalTours,
    numOfPages,
    data: {
      tours,
    },
  });
});

// @desc     Get a single tour
exports.getOneTour = catchAsync(async (req, res, next) => {
  const tours = await Tour.findById(req.params.id);
  if (!tours) {
    return next(new AppError('No Tour Found With this ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: tours,
  });
});

// @desc     Create a new tour
exports.CreateTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create({
    tourName: req.params.tourName,
    description: req.body.description,
    destination: req.body.destination,
    price: req.body.price,
    duration: req.body.duration,
    maxGroupSize: req.body.maxGroupSize,
    difficulty: req.body.difficulty,
    ratingsAverage: req.body.ratingsAverage,
  });
  res.status(201).json({
    status: 'success',
    data: newTour,
  });
});

// @desc     Update a tour
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No Tour Found With this ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: tour,
  });
});

// @desc     Delete a tour

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No Tour Found With this ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
    message: 'Tour deleted successfully',
  });
});
