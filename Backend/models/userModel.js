const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true, 
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    username:{
        type: String,
        unique: true
    },
    bio:{
        type: String
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    password:{
        type: String,
        select: false
    },
    blogs : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'blog'
        }
    ],
    savedBlogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'blog'
        }
    ],
    verify: {
        type: Boolean,
        default: false,
        select: false
    },
    googleAuth: {
        type: Boolean,
        default: false,
        select: false
    },
    profilePic:{
        type: String,
        default: null
    },
    profilePicId: {
        type: String,
        default: null
    }
}, {timestamps: true})

const userModel = mongoose.model('user',userSchema)

module.exports =  userModel