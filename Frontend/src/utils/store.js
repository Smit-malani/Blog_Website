import {configureStore} from '@reduxjs/toolkit'
import userSlice from './slices/userSlice'
import selectedBlogSlice from './slices/selectedBlogSlice'
import commentSlice from './slices/commentSlice'

const store  = configureStore({
    reducer : {
        user: userSlice,  
        currentBlog: selectedBlogSlice ,
        comment : commentSlice
    }
})

export default store 