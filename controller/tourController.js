
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'
import Tour from '../Models/TourModel'

// @desc     Get all tours
exports.getAllTours=catchAsync(async(req,res,next)=>{
    const tours=await Tour.find().sort({price:1})
    res.status(200).json({
        status:'success',
        results:tours.length,
        data:tours
    })
})

// @desc     Get a single tour
exports.getOneTour=catchAsync(async(req,res,next)=>{
    const tours=await Tour.findById(req.params.id)
    if(!tours){
        return next(new AppError('No Tour Found With this ID',404))
    }
    res.status(200).json({
        status:'success',
        data:tours
    })
})

// @desc     Create a new tour
exports.CreateTour =catchAsync(async(req,res,next)=>{
    const newTour=await Tour.create(req.body)
    res.status(201).json({
        status:'success',
        data:newTour
    })
})

// @desc     Update a tour
exports.updateTour