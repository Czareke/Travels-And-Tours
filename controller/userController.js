import User from '../Models/UserModel'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'


exports.getAllUser=catchAsync(async(req,res,next)=>{
    const users=await User.find()
    res.status(200).json({
        status:'success',
        results:users.length,
        data:users
    })
})
exports.getOneUser=catchAsync(async(req,res,next)=>{
    const user=await User.findById(req.params.id)
    if(!user){
        return next (new AppError('User not found',404))
    }
    res.status(200).json({
        status:'success',
        data:user
    })
})
exports.updateUser=catchAsync(async(req,res,next)=>{
    const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
    if(!user){
        return next(new AppError('User not found',404))
    }
    res.status(200).json({
        status:'success',
        data:user
    })
})
exports.deleteUser=catchAsync(async(req,res,next)=>{
    const user=await User.findByIdAndDelete(req.params.id)
    if(!user){
        return next(new AppError('User not found',404))
    }
    res.status(204).json({
        status:'success',
        message:'User deleted',
        data:null
    })
})