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
  const resetToken = user.getResetPasswordToken();
  try {
    await user.save({ validateBeforeSave: false });
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) have requested a password reset. \n\n Please click on the following link to reset your password: \n\n${resetURL}\n\nIf you did not request a password reset, please ignore this email and no changes will be made.`;
    await sendMail({
      to: user.email,
      subject: 'Password Reset Link',
      text: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Reset password email sent',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Failed to send email. Please try again', 500));
  }
});

// @desc reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: user,
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
