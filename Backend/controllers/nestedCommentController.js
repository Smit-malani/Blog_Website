const blogModel = require("../models/blogModel")
const commentModel = require("../models/commentModel")
const nestedCommentServices = require("../services/nestedCommentServices")

module.exports.addNestedComment = async(req, res, next)=>{
    try {
        const creater = req.user
        const {id, parentCommentId} = req.params
        const {reply} = req.body        
                
        const comment = await commentModel.findById(parentCommentId)
        const blog = await blogModel.findById(id)

        if(!comment){
            return res.status(404).json({message: 'comment Not Found', success: false})
        }
        if(!blog){
            return res.status(404).json({message: 'comment Not Found', success: false})
        }

        const newReply = await nestedCommentServices.CreateNestedComment(id, reply, parentCommentId, creater)
        await commentModel.findByIdAndUpdate(parentCommentId, {$push: {replice: newReply._id}})
        return res.status(201).json({reply: newReply , message: 'comment Added successfuly', success: true})

    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false })
    }
}