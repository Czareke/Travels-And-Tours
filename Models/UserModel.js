import mongoose from "mongoose";
import validator from 'validators'
import bcrypt from "bcrypt"
const UserSchema=new mongoose.Schema({
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
    passwordResetToken: String,
    passwordResetExpires: Date,
})

userSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) return next()
    // Hash password with a cost factor of 12 (higher = more secure, but slower)
    this.password = await bcrypt.hash(this.password, 12);
    // Remove confirmPassword field (optional security measure)
    this.confirmPassword = undefined;
    next();
});
    userSchema.pre('save', function (next) {
    // Only update timestamp if password is modified or creating new user
    if (!this.isModified('password') || this.isNew) return next();
    // Set passwordChangedAt to current time minus 1 second (ensures JWT is issued before update)
    this.passwordChangedAt = Date.now() - 1000;
    next();
});
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword) {
    // Compare provided password with hashed password using bcrypt
    return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
);
      // Log timestamps for debugging
        console.log(this.passwordChangedAt, JWTTimestamp);
      // Check if JWT timestamp is before password change
        return JWTTimestamp < changedTimestamp;
    }
    // Return false if no passwordChangedAt
    return false;
};
userSchema.methods.createPasswordResetToken = function () {
    // Generate a random 32-byte hex string as reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Hash the reset token for secure storage
    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    // Log original and hashed tokens for debugging (optional)
    console.log({ resetToken }, this.passwordResetToken);
    // Set token expiration time to 10 minutes from now
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    // Return the original (non-hashed) reset token
    return resetToken;
    userSchema.pre(/^/, function (Next) {
      // print current query
    this.find({ active: { $ne: false } });
    next();
    });
};
const User=mongoose.model('User',userSchema)
module.exports = User
