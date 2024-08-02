const path = require('path');
const AppError = require("../utils/appError");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
exports.uploadLocalImage=catchAsync(async(req,res,next)=>{
    if(!req.files){
        return next(new AppError('No file uploaded',400));
    }
    
    const tourImage = req.files.imageCover;
  // mimetype is used to validate type of file(Jpeg,pdf) being uploaded and processes them a
    if (!tourImage.mimetype.startsWith("image")) {
    return next(new AppError("Please upload an Image", 400));
    }

    const maxSize = 1024 * 10 + 20;
    if (tourImage > maxSize) {
    return next(new AppError("Image Size Should be Less 20kb", 400));
    }
  // file path that our images will be saved to
    const imagePath = path.join(
    __dirname,
    "./../public/uploads/" + `${tourImage.name}`
    );
    await tourImage.mv(imagePath);

    res.status(201).json({ image: { src: `/uploads/${tourImage.name}` } });
})

exports.uploadProductImageCloud = async (req, res) => {
    const result = await cloudinary.uploader.upload(
        req.files.imageCover.tempFilePath,
        {
        use_filename: true,
        folder: "file-upload",
        }
    );
    // to remove temp files
    fs.unlinkSync(req.files.image.tempFilePath);
    res.status(200).json({ image: { src: result.secure_url } });
    };