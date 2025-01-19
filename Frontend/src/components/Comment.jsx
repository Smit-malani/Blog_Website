import React, { useState } from 'react'
import { IoCloseOutline } from "react-icons/io5"
import { useDispatch, useSelector } from 'react-redux'
import { setIsOpen } from '../utils/slices/commentSlice'
import axios from 'axios'
import toast from 'react-hot-toast'
import { setComment, setCommentLikes } from '../utils/slices/selectedBlogSlice'
import { formateDate } from '../../../Backend/utils/formateDate'
import DisplayComment from './DisplayComment';




function Comment() {

    const dispatch = useDispatch()
    const [commentData, setCommentData] = useState("")
    const [activeReply, setActiveReply] = useState(null)
    const [currentPopup, setCurrentPopup] = useState(null)
    const [currentEditComment, setCurrentEditComment] = useState(null)

    
    
    
    const {_id,user} = useSelector(slice => slice.currentBlog)  
    
    const userSlice = useSelector(slice => slice.user)
    
    const {comment, creater} = useSelector(slice => slice.currentBlog ) 
    const creatorId =   creater?._id
     
    const token = userSlice?.token || null;
    const name = userSlice?.user?.name || '';
    const userId = userSlice?.user?._id || '';
    
    

    
    async function handleComment() {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/blog/comment/${_id}`, {commentData}, {headers: {Authorization: `Bearer ${token}`}})            
            if(res.status === 201){
                toast.success("Comment Added successfully")
                dispatch(setComment(res.data.comment))
            }
            setCommentData("")
        } catch (err) {
            toast.error(err.response.data.message || "An error occurred")
        }
    }


    
  return (
    <div className='bg-white drop-shadow-xl h-screen fixed top-0 mt-[72px] pb-14 overflow-scroll right-0 w-[400px] border-l-2 px-5 overflow-y-scroll'>
        <div className='flex items-center justify-between py-6'>
            <h1 className=' text-lg font-medium'>Comment ({comment && comment.length})</h1>
            <IoCloseOutline className='text-xl cursor-pointer' onClick={()=> dispatch(setIsOpen(false))} />
        </div>
        <div className='min-h-24 shadow-md p-3 flex flex-col gap-3 rounded-lg'>
            <div className='flex items-center gap-3'>
                <div className='h-8 w-8 overflow-hidden flex items-center justify-center rounded-full'>
                    <img className='h-full w-full object-cover' src={userSlice?.user?.profilePic ? userSlice?.user?.profilePic : `https://api.dicebear.com/9.x/initials/svg?seed=${name}`} alt="" />
                </div>
                <h1 className='text-xs capitalize font-semibold opacity-80'>{name}</h1>
            </div>
            <div>
                <textarea placeholder='What are your thoughts?' value={commentData} className='w-full min-h-24 outline-none pl-3 pt-3 text-sm drop-shadow-none placeholder:flex' onChange={(e)=> setCommentData(e.target.value)}/>
            </div>
            <div>
                <button className='bg-gray-600 hover:bg-gray-800 text-sm font-semibold text-white px-6 py-2 rounded-full' onClick={handleComment}>ADD</button>
            </div>
        </div>
        <div className='mt-6'>
            {
            comment ? <DisplayComment comment={comment} userId={userId} token={token} id={_id} creatorId={creatorId} activeReply={activeReply} setActiveReply={setActiveReply} currentPopup={currentPopup} setCurrentPopup={setCurrentPopup} currentEditComment={currentEditComment} setCurrentEditComment={setCurrentEditComment}/> : (<p>Loading Comment....</p>)
            }
        </div>
        
    </div>
  )
}

export default Comment