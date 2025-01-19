const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')

module.exports.createUser= async (name,email,password,username)=>{
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = userModel.create({
        name,
        email,
        password : hashedPassword,
        username
    })

    return user;
}

module.exports.getAllUsers = ()=>{
    const users = userModel.find().populate("blogs")
    return users
}

module.exports.getUserById = (username)=>{
    const searchedUser = userModel.findOne({username})
    .populate({
        path: "blogs",
        populate: {
            path: "creater"
        }
    })
    .populate({
        path: "savedBlogs",
        populate: {
            path: "creater"
        }
    })
    .populate("followers following")
    .populate({
        path: "followers following",
        select: "name username profilePic"
    })
    .select("-password -verify -__v -googleAuth -email")    
    return searchedUser
} 

module.exports.updateUser = (id,updates)=>{

    const updatedUser = userModel.findByIdAndUpdate(id,{$set:updates},{new:true, runValidators: true})    
    return updatedUser
}

module.exports.deleteUser = (id)=>{
    
    const deletedUser = userModel.findByIdAndDelete(id)
    return  deletedUser 
}
