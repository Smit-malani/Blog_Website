const express = require('express')
const router = express.Router()
const blogController = require('../controllers/blogController')
const commentController = require('../controllers/commentController')
const nestedCommentController = require('../controllers/nestedCommentController')
const { verifyUser } = require('../middlewares/auth')
const upload = require('../utils/multer')


//Blog
router.get('/blogs', blogController.getBlog)

router.get('/blog/:blogId', blogController.getBlogById)

router.post('/blog',verifyUser, upload.fields([{name: "image"},{name: "images"}]), blogController.createBlog)

router.patch('/blog/:id', verifyUser, upload.fields([{name: "image"},{name: "images"}]), blogController.updateBlog)

router.delete('/blog/:id', verifyUser, blogController.deleteBlog)


//Like
router.post('/blog/like/:id', verifyUser, blogController.likeBlog)


//Comment
router.post('/blog/comment/:id', verifyUser, commentController.addComment)

router.delete('/blog/comment/:id', verifyUser, commentController.deleteComment)

router.patch('/blog/comment/:id', verifyUser, commentController.editComment)

router.patch('/blog/comment/like/:id', verifyUser, commentController.likeComment)

// nested comment
router.post('/comment/:parentCommentId/:id', verifyUser, nestedCommentController.addNestedComment)

//save blog
router.patch('/save-blog/:id', verifyUser, blogController.saveBlog)

//search blog

router.get('/search-blogs', blogController.searchBlog)







module.exports = router