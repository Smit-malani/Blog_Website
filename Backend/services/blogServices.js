const blogModel = require('../models/blogModel')
const commentModel = require('../models/commentModel')
const userModel = require('../models/userModel')

module.exports.getAllBlogs = (skip, limit) => {
    const blogs = blogModel.find({ draft: false })
        .populate({
            path: "creater",
            select: "-password"
        })
        .populate({
            path: "likes",
            select: "name email"
        })
        .sort({
            createdAt: -1
        })
        .skip(skip)
        .limit(limit)
    return blogs
}

module.exports.getBlogById = async (blogId) => {
    const blog = await blogModel.findOne({ blogId })
        .populate({
            path: "comment",
            populate: {
                path: "user",
                select: "name email profilePic"
            }
        })
        .populate({
            path: "creater",
            select: "name email followers following username profilePic",
        }).lean()

    async function populateReplice(comments) {
        for (const comment of comments) {
            let populatedComment = await commentModel.findById(comment._id).populate({
                path: "replice",
                populate: {
                    path: "user",
                    select: "name email profilePic"
                }
            }).lean()
            comment.replice = populatedComment.replice

            if (comment.replice && comment.replice.length > 0) {
                await populateReplice(comment.replice)
            }
        }
        return comments
    }

    blog.comment = await populateReplice(blog.comment)
    return blog
}

module.exports.createBlog = (title, description, draft, creater, secure_url, public_id, blogId, content, tags) => {
    const blog = blogModel.create({
        title,
        description,
        content,
        draft,
        creater,
        image: secure_url,
        imageId: public_id,
        blogId,
        tags
    })

    return blog
}

module.exports.updateBlog = (id, updates) => {
    const updatedBlog = blogModel.findOneAndUpdate({ blogId: id }, { $set: updates }, { new: true, runValidators: true })
    return updatedBlog
}

module.exports.deleteBlog = (id) => {
    const deletedBlog = blogModel.findByIdAndDelete(id)
    return deletedBlog
}

module.exports.isUser = (creater) => {
    const isUser = userModel.findById(creater)
    return isUser
}