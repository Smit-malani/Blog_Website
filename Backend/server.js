const dotenv = require('dotenv')
dotenv.config()
const connectDB = require('./DB/db.js')
const app = require('./app.js')
const { cloudinaryConfig } = require('./config/cloudinary.js')

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB()
    cloudinaryConfig()
})
