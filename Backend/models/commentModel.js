const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    comment:{
        type: String
    }
    ,blog:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog'
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    replice: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comment'
        }
    ],
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment',
        default: null
    }
},{
    timestamps: true
}
)

const commentModel = mongoose.model('comment', commentSchema)

module.exports = commentModel