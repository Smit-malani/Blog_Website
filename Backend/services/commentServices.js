const commentModel = require('../models/commentModel')

module.exports.createComment = (comment,id,creater)=>{
    const addComment = commentModel.create({
        comment,
        blog: id,
        user: creater
    }).then((comment)=>{
        return comment.populate({
            path : 'user',
            select : 'name email'
        })
    })
    return addComment
}



module.exports.editComment = (id, updateComment)=>{
    const editedComment = commentModel.findByIdAndUpdate(id, {comment: updateComment}, {new:true, runValidators: true}).then((comment)=> {
        return comment.populate({
            path: "user",
            select: "name email"
        })
    })
    return editedComment
}