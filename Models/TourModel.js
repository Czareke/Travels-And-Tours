const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    tourName: {
        type: String,
        required: [true,'Enter tour name'],
        trim: true,
},
    description: {
        type: String,
        required: [true,'Enter tour description'],
        trim: true,
},
    destination: {
        type: String,
        required: [true,'Enter destination'],
        trim: true,
},
    price: {
        type: Number,
        required: [true,'Enter price'],
},
    duration:{
        type: Number,
        required: [true,'Enter duration'],
    },
    maxGroupSize: {
    type: Number,
    required: [true,'Enter max group size'],
},
    ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: (val) => Math.round(val * 10) / 10, // round to 1 decimal placev
    
},
    ratingsQuantity: {
    type: Number,
    default: 0,
},
    summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary'],
},
    imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
},
    images: [String],
    createdAt: {
    type: Date,
    default: Date.now,
    select: false,
},
    startLocation: {
    // GeoJSON
    type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
},
locations: [
    {
    type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
    },
],
createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
},
//     guides: [
//     {
//     type: mongoose.Schema.ObjectId,
//     ref: 'User',
//     },
// ],
});

// Middleware to automatically set the tour agent

tourSchema.pre('save', async function (next) {
    if (!this.createdBy) {
    throw new Error('createdBy field is required');
    }
    next();
});

// Middleware to automatically update the tour dates
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
