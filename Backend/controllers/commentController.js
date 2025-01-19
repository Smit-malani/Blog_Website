const blogModel = require("../models/blogModel")
const commentModel = require("../models/commentModel")
const userModel = require("../models/userModel")
const commentServices = require("../services/commentServices")

module.exports.addComment = async(req,res,next)=>{
    try {
        const {id} = req.params 
        const creater = req.user
        const {commentData} = req.body       
        

        const isBlog = await blogModel.findById(id)
        if(!commentData){
            return res.status(400).json({message: 'Please enter comment'})
        }else{
            const isUser = await userModel.findById(creater)
            if(!isUser){
                return res.status(401).json({message: 'You are not unauthorized, please Sign-Up', success: false})
            }
            else{
                const addComment = await commentServices.createComment(commentData,id,creater)
                if(!addComment){
                    return res.status(404).json({message: 'comment Not Added', success: false})
                }else{
                    await blogModel.findByIdAndUpdate(id, {$push :{comment:addComment._id}})
                    return res.status(201).json({comment: addComment, message: 'comment Added successfuly', success: true})
                }
            }
        }
    } catch (err) {        
        return res.status(500).json({ message: 'Internal Server Error', success: false })
    }   
}

module.exports.deleteComment = async(req,res,next)=>{
    try {
        const {id} = req.params
        const userId = req.user

        const comment = await commentModel.findById(id).populate({path: "blog", select: "creater"})
        if(!comment){
            return res.status(401).json({message: 'Comment Not Found', success: false})
        }
        if(comment.user != userId && comment.blog.creater != userId){
            return res.status(401).json({message: 'You are not unauthorized, please Sign-Up', success: false})
         }
            
        async function deleteCommentAndReplice(id) {
                let comment = await commentModel.findById(id)

                for(let replayId of comment.replice){
                    await deleteCommentAndReplice(replayId)
                }
                if(comment.parentComment){
                    await commentModel.findByIdAndUpdate(comment.parentComment, { $pull: {replice: id}})
                }
                await commentModel.findByIdAndDelete(id)
            }

            await deleteCommentAndReplice(id)

            await blogModel.findByIdAndUpdate(comment.blog._id, {$pull :{comment:comment.id}})
            return res.status(201).json({message: 'comment deleted successfuly', success: true})
             
    } catch (err) {        
        return res.status(500).json({ message: 'Internal Server Error', success: false })
    }   
}

module.exports.editComment = async(req,res,next)=>{
    try {
        
        const {id} = req.params 
        const creater = req.user
        const {updateComment} = req.body

        const comment = await commentModel.findById(id)
        if(!comment){
            return res.status(404).json({message: 'comment Not found', success: false})
        }

        if(comment.user != creater){
            return res.status(401).json({message: 'You are not unauthorized, please Sign-Up', success: false})
        }else{
            const editedComment = await commentServices.editComment(id, updateComment)
            if(!editedComment){
                return res.status(404).json({message: 'comment Not Ediited', success: false})
            }else{
                return res.status(201).json({comment: editedComment, message: 'comment edited successfuly', success: true})
            }
        }
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false })
    }   
}

module.exports.likeComment = async(req, res, next)=>{
    try {
        const {id} = req.params
        const users = req.user

        const comment = await commentModel.findById(id)
        if(comment == null){
            return res.status(404).json({message: 'Comment Not Found', success: false})
        }
        if(comment.likes.includes(users)){
            await commentModel.findByIdAndUpdate(id,{$pull: {likes: users}})
            return res.status(200).json({message: 'comment Unliked successfuly', success: true})
        }else{
            await commentModel.findByIdAndUpdate(id, {$push: {likes: users}})
            return res.status(200).json({message: 'comment Liked successfuly', success: true})
        }

    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false })
    }
}
