const { cloudinaryConfig } = require('../config/cloudinary')

const cloudinary = require('cloudinary').v2

module.exports.uploadImage = async(imagePath)=>{
    try {
        cloudinaryConfig()
        const result = await cloudinary.uploader.upload(imagePath,{
            folder: "blog_web_app"
        })

        return result
    } catch (err) {
    }
}