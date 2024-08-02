const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const userSchema=new mongoose.Schema({
    email:{
        type:String,
        trim:true,
        required:[true,'Enter email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Enter a valid email address'] 
    },
    password:{
        type: String,
        required: [true, 'Enter Valid Password With Uppercase and Lowercase And Must be at least 8 characters long'],
        match: [
            /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
            'Password must contain at least one uppercase letter, one lowercase letter, and be at least 8 characters long.',
        ],
        select: false,
        minlength: 8,
        maxlength: 15,
    },
    confirmPassword:{
        type: String,
        required: [true, 'Confirm Password is Required'],
        validator: function (el) {
            return el === this.password;
        },
        message: 'Both Password and Confirm Password do not match.',
    },
    role:{
        type: String,
        enum: ['user','travelAgent','admin'],
        default: 'user'
    },
    customerLevel:{
        type: String,
        enum: ['basic','premium','elite'],
        default: 'basic'
    },
    passwordChangedAt: Date,
    passwordResetOTP: String,
    passwordResetOTPExpires: Date,
})

// runs before the doc is saved(pre)if you want it to run after we use post(middleware for signup in authController)
userSchema.pre("save", async function (next) {
    // Run only when password is modified
    if (!this.isModified("password")) return next();
  
    // hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
  
    // Deleted the passwordConfirm field
    this.confirmPassword = undefined;
  
    next();
  });
  userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });
  
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
    return bcrypt.compare(candidatePassword, userPassword);
  };
  
  userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      console.log(this.passwordChangedAt, JWTTimestamp);
      return JWTTimestamp < changedTimestamp;
    }
  };
userSchema.methods.createPasswordResetOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    this.passwordResetOTP = crypto.createHash('sha256').update(otp).digest('hex');
    this.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return otp;
}; 
const User=mongoose.model('User',userSchema)
module.exports = User
