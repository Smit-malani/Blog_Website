const mongoose = require('mongoose');

async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI_DB)
        console.log("DB connected Successsfully")  
    } catch (err) {
        console.error(err)
        console.log("DB does not connected Successfully");
    }
}

module.exports = connectDB