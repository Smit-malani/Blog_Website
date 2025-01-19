const { promises } = require('dns')
const blogModel = require('../models/blogModel')
const userModel = require('../models/userModel')
const blogServices = require('../services/blogServices')
const { deleteImageCloud } = require('../utils/deleteImage')
const { uploadImage } = require('../utils/uploadImage')
const fs = require('fs')
const ShortUniqueId = require('short-unique-id')
const { randomUUID } = new ShortUniqueId({ length: 10 });

module.exports.getBlog = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const skip = (page - 1) * limit

        const blogs = await blogServices.getAllBlogs(skip, limit)
        const totalBlogs = await blogModel.countDocuments({ draft: false })
        res.status(200).json({ blog: blogs, hasMore: skip + limit < totalBlogs, message: 'Blogs Found Successfully', success: true })
    } catch (err) {        
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

module.exports.getBlogById = async (req, res, next) => {
    try {
        const { blogId } = req.params
        const searchedBlog = await blogServices.getBlogById(blogId)

        if (!searchedBlog) {
            return res.status(404).json({ message: 'No Such Blog found', success: false })
        } else {
            res.status(200).json({ blog: searchedBlog, message: 'Blogs Found Successfully', success: true })
        }
    } catch (err) {

        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

module.exports.createBlog = async (req, res, next) => {
    try {

        const creater = req.user
        const { title, description  } = req.body
        const draft = req.body.draft == "false" ? false : true
        const content = JSON.parse(req.body.content)
        const tags = JSON.parse(req.body.tags)
        const { images, image } = req.files

        if (!title || !description || !content) {
            return res.status(400).json({ message: 'Please enter all details', success: false })
        }
        const isUSer = await blogServices.isUser(creater)
        if (!isUSer) {
            return res.status(401).json({ message: 'You are not unauthorized, please Sign-Up' })
        } else {
            const blogId = title.toLowerCase().split(" ").join("-") + "-" + randomUUID()
            let imageIndex = 0
            for (let i = 0; i < content.blocks.length; i++) {

                const block = content.blocks[i]
                if (block.type == "image") {
                    const { secure_url, public_id } = await uploadImage(
                        `data:image/jpeg;base64,${images[imageIndex].buffer.toString("base64")}`
                    )
                    block.data.file = {
                        url: secure_url,
                        imageId: public_id
                    }
                    imageIndex++
                }
            }

            const { secure_url, public_id } = await uploadImage(`data:image/jpeg;base64,${image[0].buffer.toString("base64")}`)

            const blog = await blogServices.createBlog(title, description, draft, creater, secure_url, public_id, blogId, content, tags)
            if (blog.length === 0) {
                return res.status(404).json({ message: 'Blog Not Created', success: false })
            }

            await userModel.findByIdAndUpdate(creater, { $push: { blogs: blog._id } })
            if (draft) {
                return res.status(200).json({ blog: blog, message: 'Blag saved as draft. You can public it from your profile', success: true })
            }
            return res.status(201).json({ blog: blog, message: 'Blog created successfully', success: true })
        }
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

module.exports.updateBlog = async (req, res, next) => {
    try {
        const { id } = req.params
        const creater = req.user
        const { title, description } = req.body
        
        const draft = req.body.draft == "false" ? false : true
        
        const content = JSON.parse(req.body.content)
        const tags = JSON.parse(req.body.tags)
        const { image, images } = req.files
        const existingImages = JSON.parse(req.body.existingImages)

        if (!title && !description) {
            return res.status(400).json({ message: 'At least one field must be provided to update', success: false })
        }

        const isBlog = await blogModel.findOne({ blogId: id })

        if (isBlog == null) {
            return res.status(404).json({ message: 'Blog not found', success: false })
        }

        if (!(creater == isBlog.creater)) {
            return res.status(401).json({ message: 'you are not authorized for this action', success: false })
        } else {
            let imagesToDelete = isBlog.content.blocks.filter((block) => block.type == "image").filter((block) => !existingImages.find(({ url }) => url == block.data.file.url)).map((block) => block.data.file.imageId)

            if (imagesToDelete.length > 0) {
                await Promise.all(
                    imagesToDelete.map((id) => deleteImageCloud(id))
                )
            }
            if (images) {
                let imageIndex = 0
                for (let i = 0; i < content.blocks.length; i++) {
                    const block = content.blocks[i]
                    if (block.type == "image" && block.data.file.image) {
                        const { secure_url, public_id } = await uploadImage(
                            `data:image/jpeg;base64,${images[imageIndex].buffer.toString("base64")}`
                        )
                        block.data.file = {
                            url: secure_url,
                            imageId: public_id
                        }
                        imageIndex++
                    }
                }
            }
            if (!image) {
                const updatedBlog = await blogServices.updateBlog(id, { title, description, draft, content, tags })
                if (!updatedBlog) {
                    return res.status(404).json({ message: 'Blog not found', success: false })
                }

                if (draft) {
                    return res.status(200).json({ blog: updatedBlog, message: 'Blag saved as draft. You can public it from your profile', success: true })
                }

                return res.status(200).json({ blog: updatedBlog, message: 'Blog Updated Successfully', success: true })

            }
            if (image) {
                await deleteImageCloud(isBlog.imageId)
                const { secure_url, public_id } = await uploadImage(`data:image/jpeg;base64,${image[0].buffer.toString("base64")}`)
                const updatedBlog = await blogServices.updateBlog(id, { title, description, draft, content, image: secure_url, imageId: public_id, tags })
                if (!updatedBlog) {
                    return res.status(404).json({ message: 'Blog not found', success: false })
                }

                if (draft) {
                    return res.status(200).json({ blog: updatedBlog, message: 'Blag saved as draft. You can public it from your profile', success: true })
                }
                return res.status(200).json({ blog: updatedBlog, message: 'Blog Updated Successfully', success: true })

            }
        }
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

module.exports.deleteBlog = async (req, res, next) => {
    try {
        const { id } = req.params
        const creater = req.user
        const isBlog = await blogModel.findById(id)
        if (isBlog == null) {
            return res.status(404).json({ message: 'Blog not found', success: false })
        }

        if (!(creater == isBlog.creater)) {
            return res.status(401).json({ message: 'you are not authorized for this action', success: false })
        } else {

            await deleteImageCloud(isBlog.imageId)
            const result = await blogServices.deleteBlog(id)
            await userModel.findByIdAndUpdate(creater, { $pull: { blogs: id } })
            if (!result) {
                return res.status(404).json({ message: 'Blog not deleted', success: false })
            }
            res.status(200).json({ message: 'Blog deleted successfullty', success: true })
        }

    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

module.exports.likeBlog = async (req, res, next) => {
    try {
        const { id } = req.params
        const creater = req.user

        const blog = await blogModel.findOne({ blogId: id })
        if (blog == null) {
            return res.status(404).json({ message: 'Blog not found', success: false })
        }
        if (blog.likes.includes(creater)) {
            await blogModel.findOneAndUpdate({ blogId: id }, { $pull: { likes: creater } })
            return res.status(200).json({ message: 'Blog Unliked successfuly', success: true })
        } else {
            await blogModel.findOneAndUpdate({ blogId: id }, { $push: { likes: creater } })
            return res.status(200).json({ message: 'Blog Liked successfuly', success: true })
        }
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

module.exports.saveBlog = async (req, res, next) => {
    try {
        const { id } = req.params
        const creater = req.user

        const blog = await blogModel.findById(id)
        if (blog == null) {
            return res.status(404).json({ message: 'Blog not found', success: false })
        }
        if (blog.totalSaves.includes(creater)) {
            await blogModel.findByIdAndUpdate(id, { $pull: { totalSaves: creater } })
            await userModel.findByIdAndUpdate(creater, { $pull: { savedBlogs: id } })
            return res.status(200).json({ message: 'Blog Unsaved successfuly', success: true })
        } else {
            await blogModel.findByIdAndUpdate(id, { $set: { totalSaves: creater } })
            await userModel.findByIdAndUpdate(creater, { $set: { savedBlogs: id } })
            return res.status(200).json({ message: 'Blog Saved successfuly', success: true })
        }
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

module.exports.searchBlog = async (req, res, next) => {
    try {                
        const  {search, tag}  = req.query

        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const skip = (page - 1) * limit
        let query

        if(tag){
            query = {tags: tag}
        }else{
            query = { title: { $regex: search, $options: "i" } }
        }
        const blogs = await blogModel.find(query, { draft: false })
            .populate({
                path: "creater"
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

        if (blogs.length == 0) {
            return res.status(400).json({ message: 'Try diffrent Keyword', hasMore: skip + limit < blogs, success: false })
        }

        const totalBlogs = await blogModel.countDocuments(query, { draft: false })

        return res.status(200).json({ blogs, hasMore: skip + limit < totalBlogs, message: '', success: true })

    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

