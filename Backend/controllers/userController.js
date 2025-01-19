const dotenv = require('dotenv');
dotenv.config()
const userModel = require('../models/userModel')
const userServices = require('../services/userServices')
const bcrypt = require('bcrypt')
const { generateJwtToken } = require('../utils/generateJwtToken')
const transporter = require('../utils/transporter')
const { verifyJwtToken } = require('../utils/verifyJwtToken')
const admin = require("firebase-admin")
const { getAuth } = require("firebase-admin/auth")
const ShortUniqueId = require('short-unique-id')
const { randomUUID } = new ShortUniqueId({ length: 5 })
const { deleteImageCloud } = require('../utils/deleteImage')
const { uploadImage } = require('../utils/uploadImage')



admin.initializeApp({
    credential: admin.credential.cert({
        "type": process.env.FIREBASE_TYPE,
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "client_id": process.env.FIREBASE_CLIENT_ID,
        "auth_uri": process.env.FIREBASE_AUTH_URI,
        "token_uri": process.env.FIREBASE_TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
        "universe_domain": process.env.FIREBASE_UNIVERDE_DOMAIN
    })
})

module.exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        if (!name && !email && !password) {
            return res.status(400).json({ message: 'Please enter all details', success: false })
        }
        const sendEmail = email
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            if (existingUser.googleAuth) {
                res.status(400).json({ message: 'This email is alredy registered, Please try Through Google', success: false })
            }
            res.status(400).json({ message: 'User Alredy Register With This Email', success: false })
        }

        const username = email.split("@")[0] + randomUUID()
        const newUser = await userServices.createUser(name, email, password, username)
        const jwtToken = await generateJwtToken({ email: newUser.email, id: newUser._id })
        const userWithoutPassword = await userModel.findById(newUser._id).select('-password')

        const sendingEmail = transporter.sendMail({
            from: process.env.SEND_MAIL_FROM,
            to: sendEmail,
            subject: process.env.SEND_MAIL_SUBJECT,
            text: process.env.SEND_MAIL_TEXT,
            html: `<h1>Click on Link to vrify your email</h1>
                    <a href="${process.env.FRONTEND_URL}/verify-email/${jwtToken}">Verify Email</a>`
        })
        res.status(201).json({ message: 'Please check youe E-mail to verify your account', success: false })

    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', success: false })
    }
}

module.exports.verifyToken = async (req, res, next) => {
    try {
        const { verificationToken } = req.params

        const verifyToken = await verifyJwtToken(verificationToken)
        if (!verifyToken) {
            return res.status(400).json({ message: 'Inavlid Token/Email Expired', success: false })
        }

        const { id } = verifyToken
        const user = await userModel.findByIdAndUpdate(id, { verify: true }, { new: true })

        if (!user) {
            res.status(400).json({ message: 'Please Enter currect Email Or Password', success: false })
        }

        return res.status(200).json({ message: 'Email verifyed Successfully', success: true })

    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', success: false })
    }
}

module.exports.googleAuth = async (req, res, next) => {
    try {
        const { accessToken } = req.body
        const response = await getAuth().verifyIdToken(accessToken)
        const { name, email } = response

        let user = await userModel.findOne({ email })        
        if (user) {
            if (user.googleAuth) {
                const jwtToken = await generateJwtToken({ email: user.email, id: user._id })
                return res.status(200).json({ user: { user: user, token: jwtToken }, message: 'Logged In successfully', success: true })
            } else {
                return res.status(400).json({ message: 'This email is alredy registered, Please Enter Email and Password', success: false })
            }
        }

        const username = email.split("@")[0] + randomUUID()

        let newUser = await userModel.create({
            name,
            email,
            username,
            googleAuth: true,
            verify: true
        })
        const jwtToken = await generateJwtToken({ email: newUser.email, id: newUser._id })
        res.status(200).json({ user: { user: newUser, token: jwtToken }, message: 'Registerd successfully', success: true })

    } catch (err) {
        console.log(err)
        
        res.status(500).json({ message: 'Internal Server Error', success: false })
    }
}

module.exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all details', success: false })
        }
        const existingUser = await userModel.findOne({ email }).select("password verify googleAuth email")

        if (!existingUser) {
            res.status(400).json({ message: 'Please Enter currect Email Or Password', success: false })
        }

        const jwtToken = await generateJwtToken({ email: existingUser.email, id: existingUser._id })

        if (!existingUser.verify) {

            const sendingEmail = transporter.sendMail({
                from: process.env.SEND_MAIL_FROM,
                to: email,
                subject: process.env.SEND_MAIL_SUBJECT,
                text: process.env.SEND_MAIL_TEXT,
                html: `<h1>Click on Link to vrify your email</h1>
                <a href="${process.env.FRONTEND_URL}/verify-email/${jwtToken}">Verify Email</a>`
            })

            return res.status(400).json({ message: 'Please vrify your Email', success: false })
        }

        if (existingUser.googleAuth) {
            res.status(400).json({ message: 'This email is alredy registered, Please try Through Google', success: false })
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
        const user = await userModel.findById(existingUser._id).select('-password')

        if (!isPasswordCorrect) {
            res.status(401).json({ message: 'Please Enter currect Email Or Password', success: false })
        } else {
            res.status(200).json({ user: { user: user, token: jwtToken }, message: 'logged In successfully', success: true })
        }

    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', success: false })
    }
}

module.exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await userServices.getAllUsers()
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found', success: false })
        }
        else {
            res.status(200).json({ user: users, message: 'User Found Successfully', success: true })
        }
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

module.exports.getUserById = async (req, res, next) => {
    try {
        const { username } = req.params
        const searchedUser = await userServices.getUserById(username)

        if (searchedUser.length === 0) {
            return res.status(404).json({ message: 'No Such User Found', success: false })
        } else {
            return res.status(200).json({ user: searchedUser, message: 'User Found Successfully', success: true })
        }
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

module.exports.ChangeUserDetails = async (req, res, next) => {
    try {
        const { id } = req.params
        const image = req.file
        const { name, bio } = req.body

        const user = await userModel.findById(id)
        const jwtToken = await generateJwtToken({ email: user.email, id })

        if (!req.body.profilePic) {
            if (user.profilePicId) {
                await deleteImageCloud(user.profilePicId)
            }
            user.profilePic = null,
                user.profilePicId = null
        }
        if (image) {

            const { secure_url, public_id } = await uploadImage(
                `data:image/jpeg;base64,${image.buffer.toString("base64")}`
            )
            user.profilePic = secure_url,
                user.profilePicId = public_id
        }

        user.name = name
        user.bio = bio

        await user.save()
        return res.status(200).json({ user: { user: user, token: jwtToken }, message: 'Profile Updated Successfully', success: true })
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

module.exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params
        const result = await userServices.deleteUser(id)
        if (!result) {
            return res.status(404).json({ message: 'User not found', success: false })
        }
        res.status(200).json({ message: 'User deleted successfullty', success: true })
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

module.exports.followUser = async (req, res, next) => {
    try {
        const { id } = req.params // auther id which is follow by UserId
        const followerId = req.user // Who follow

        const user = await userModel.findById(id)
        if (user == null) {
            return res.status(404).json({ message: 'User not found', success: false })
        }
        if (user.followers.includes(followerId)) {
            await userModel.findByIdAndUpdate(id, { $pull: { followers: followerId } }) // for creater
            await userModel.findByIdAndUpdate(followerId, { $pull: { following: id } }) // for follower
            return res.status(200).json({ message: 'Unfollow successfully', success: true })
        } else {
            await userModel.findByIdAndUpdate(id, { $set: { followers: followerId } }) //for creater
            await userModel.findByIdAndUpdate(followerId, { $set: { following: id } })  // for follower
            return res.status(200).json({ message: 'Followed successfuly', success: true })
        }
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

