import User from '../Models/userModel';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';
import sendMail from '../utils/email';
import catchAsync from '../utils/catchAsync';
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

  const otp = user.createPasswordResetOTP();
  await user.save({ validateBeforeSave: false });

  const message = `You are receiving this email because you (or someone else) have requested a password reset. \n\n Your OTP for password reset is: ${otp} \n\n If you did not request a password reset, please ignore this email and no changes will be made.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset OTP (valid for 10 minutes)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'OTP sent to email!'
    });
  } catch (err) {
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

// @desc reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedOTP = crypto.createHash('sha256').update(req.body.otp).digest('hex');

  const user = await User.findOne({
    passwordResetOTP: hashedOTP,
    passwordResetOTPExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('OTP is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password has been reset!'
  });
});
// @desc protect
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError(
        'You are not logged in. Please login to access this route',
        401
      )
    );
  }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);
    const user = await User.findById(decoded.id);
    if (!user) {
    return next(new AppError('User no longer exists', 404));
    }
    if (
    user.changePasswordDate &&
    Date.now() - user.changePasswordDate < 1000 * 60 * 60 * 24
) {
    return next(
        new AppError(
        'User has changed password recently. Please change password again',
        401
        )
    );
    }
    req.user = user;
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
  const filteredBody = filterObj(req.body, "firstName", "lastName", "email");
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

