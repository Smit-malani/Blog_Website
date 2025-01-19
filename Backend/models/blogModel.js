const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: {
        type : String,
        trim : true,
        required : true
    },
    description: {
        type : String,
        required : true
    },
    content:{
      type: Object,
      require: true  
    },
    blogId: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type : String,
        required : true
    },
    imageId: {
        type : String,
        required : true
    },
    draft: {
        type : Boolean,
        default : false
    },
    creater: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    comment: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comment'
        }
    ],
    totalSaves: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    tags: {
        type: [String]
    }
},{
    timestamps: true
})

const blogModel = mongoose.model('blog',blogSchema)

module.exports = blogModel