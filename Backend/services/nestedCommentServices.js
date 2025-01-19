const commentModel = require("../models/commentModel")


module.exports.CreateNestedComment = (id, reply, parentCommentId, creater)=>{
    const newReply = commentModel.create({
        blog: id,
        comment: reply,
        parentComment: parentCommentId,
        user: creater
    }).then((reply)=>{
        return reply.populate({
            path : 'user',
            select : 'name email'
        })
    })
    
    return newReply
}