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


const app = express();
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

module.exports= app;
