const cloudinary = require('cloudinary').v2


module.exports.cloudinaryConfig = async()=>{
    try {
        await cloudinary.config({
            cloud_name: process.env.CLOUDINERY_CLOUD_NAME,
            api_key: process.env.CLOUDINERY_API_KEY,
            api_secret: process.env.CLOUDINERY_API_SECRET
        })
        console.log("cloudinary config done")
    } catch (err) {
        console.log(err)
        console.log("error while cloudinary config")
    }
}