const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const authRoutes = require('./Routes/authRoutes');
const bookingRoutes = require('./Routes/bookingRoutes');
const paymentRoutes = require('./Routes/paymentRoutes');
const tourRoutes = require('./Routes/tourRoutes');
const userRoutes = require('./Routes/userRoutes');
const globalErrorHandler = require('./controller/errorController')
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const path=require ('path')

require("express-async-errors");
const app = express();
    cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    });
app.use(express.static("./public"));
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(bodyParser.json());

app.enable('trust proxy');
// secure http headers
app.use(helmet());
// implement cors
app.use(cors());
// access-control-allow-origin
app.options('*', cors());
// Development logging
app.use(morgan('dev'));
app.set('trust proxy', 1)
// limit req from some ip
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP address, try again after an hour',
});
app.use('/api', limiter);
// data sanitation against noSQL, query injection
app.use(mongoSanitize());
app.use(hpp());

// routes
app.get('/', (req, res, next) => {
    res.send('<h1>Travels and Tours</h1>');
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve home.html as the entry point
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.use(globalErrorHandler)
module.exports= app;
