import User from '../Models/UserModel';
import jwt from 'jsonwebtoken'
import crypto from 'crypto';
import {promisify} from 'util'
import sendMail from '../utils/email'
const signToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
}

//@desc user registration
exports.createUser=catchAsync(async(req,res,next)=>{
    const newUser=await User.create({
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        role:req.body.role,
        customerLevel:req.body.customerLevel
    })
    const token=signToken(newUser._id);
    res.status(201).json({
        status:'success',
        token,
        data:newUser
    })
})

// @desc user login
exports.login=catchAsync(async(req,res,next)=>{
    const {email,password}=req.body;
    if(!email ||!password){
        return next(new AppError('Please provide email and password',400))
    }
    const user=await User.findOne({email}).select('+password')
    if(!user ||!(await user.comparePassword(password,user.password))){
        return next(new AppError('Incorrect email or password',401))
    }
    const token=signToken(user._id);
    res.json({
        status:'success',
        token,
        data:user
    })
})