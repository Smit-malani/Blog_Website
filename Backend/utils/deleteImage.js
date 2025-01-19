
const cloudinary = require('cloudinary').v2

module.exports.deleteImageCloud = async(imageId)=>{
    try {
        const result = await cloudinary.uploader.destroy(imageId)
        return result
    } catch (err) {

    }
}