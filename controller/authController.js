const User = require('../Models/userModel.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const util = require('util');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError =require('../utils/appError');
const { promisify } = require('util');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//@desc user registration
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
    customerLevel: req.body.customerLevel,
  });
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: newUser,
  });
});

// @desc user login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = signToken(user._id);
  res.json({
    status: 'success',
    token,
    data: user,
  });
});

// @desc forgot password


exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }

  // Generate OTP
  const otp = crypto.randomBytes(3).toString('hex'); // Generates a 6-digit hex string

  // Set OTP and its expiration time
  user.passwordResetOTP = otp;
  user.passwordResetOTPExpires = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

  await user.save({ validateBeforeSave: false });

  // Send OTP to the user
  const message = `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`;
  await sendEmail({
    email: user.email, // Ensure this is correctly passed
    subject: 'Password Reset OTP',
    message: message,
  });

  res.status(200).json({
    status: 'success',
    message: 'OTP sent to email',
  });
});

// @desc reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { otp, newPassword } = req.body;
  const user = await User.findOne({
    passwordResetOTP: otp,
    passwordResetOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

 // Update the user's password and confirmPassword for validation purposes
  user.password = newPassword;
  user.confirmPassword = newPassword;

 // Clear the OTP and its expiration time from the user's record
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});
// @desc protect
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(token);

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }

  // 2) Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  
  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token does not exist.", 401)
    );
  }

  // 4) Check if the user changed password after token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again.", 401)
    );
  }

  // Grant access to protected route
  req.user = freshUser;
  next();
});




// @desc restrict to admin
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return next(new AppError('Unauthorized to access this route', 403));
    }
    next();
    };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1)get the user from the database
  const user = await User.findById(req.user.id).select("+password");
  // user.findByAndUpdate will not work and won't validate encryption

  // 2)check if current password matches the same in the db
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Invalid Password", 401));
  }
  // 3)if correct,update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // 4)log user in,send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1)create error if user post password data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "this is not for Password updates,please use updateMyPassword",
        400
      )
    );
  }

  // 2)filter for unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "email");
  // 3)update user doc
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: "null",
    message: "User deleted successfully",
  });
});

