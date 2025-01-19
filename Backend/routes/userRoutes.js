const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { verifyUser } = require('../middlewares/auth')
const upload = require('../utils/multer')


router.post('/register', userController.registerUser)

router.post('/login', userController.loginUser)

router.get('/users', userController.getAllUsers)

router.get('/users/:username', userController.getUserById)

router.patch('/users/details/:id', verifyUser, upload.single("profilePic"),  userController.ChangeUserDetails)
  
router.delete('/delete/:id', userController.deleteUser)

router.get('/verify-email/:verificationToken', userController.verifyToken)

router.post('/google-auth', userController.googleAuth)

router.patch('/follow/:id', verifyUser, userController.followUser)


module.exports = router