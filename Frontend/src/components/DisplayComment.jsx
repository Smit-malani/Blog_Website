import React, { useState } from 'react'
import { formateDate } from '../../../Backend/utils/formateDate'
import { BsThreeDots } from "react-icons/bs"
import { BiLike } from "react-icons/bi"
import { BiSolidLike } from "react-icons/bi"
import { FaRegComment } from "react-icons/fa6"
import { IoIosClose } from "react-icons/io"
import toast from 'react-hot-toast'
import { deleteCommentAndReply, setCommentLikes, setReplice, setUpdatedComment } from '../utils/slices/selectedBlogSlice'
import { useDispatch } from 'react-redux'
import axios from 'axios'

function DisplayComment({comment, userId, token, id, creatorId, activeReply, setActiveReply, currentPopup, setCurrentPopup, currentEditComment, setCurrentEditComment}) {    
    
    const dispatch = useDispatch()
    const [reply, setReply] = useState('')
    const [updateComment, setUpdateComment] = useState('')

     async function handleCommentLike(commentId) {
            try {
                const res = await axios.patch(`${import.meta.env.VITE_BASE_URL}/blog/comment/like/${commentId}`, {}, {headers:{Authorization: `Bearer ${token}`}})
                toast.success(res.data.message)
                dispatch(setCommentLikes({commentId, userId}))
            } catch (err) {
                toast.error(err.response.data.message || "An error occurred")
            }
            
        }

        function handleActiveReply(id){
            setActiveReply((prev) => prev == id ? null : id)
        }

        async function handleReplyComment(parentCommentId) {
                try {
                    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/comment/${parentCommentId}/${id}`, {reply}, {headers: {Authorization: `Bearer ${token}`}})            
                    if(res.status === 201){
                        toast.success("Comment Added successfully")
                    }
                    setReply("")
                    setActiveReply(null)
                    dispatch(setReplice(res.data.reply))
                } catch (err) {
                    toast.error(err.response.data.message || "An error occurred")
                }
        }

        async function handleCommentUpdate(id) {
            try {
                const res = await axios.patch(`${import.meta.env.VITE_BASE_URL}/blog/comment/${id}`, {updateComment}, {headers: {Authorization: `Bearer ${token}`}})            
                if(res.status === 201){                    
                    toast.success("Comment Updated successfully")
                }
                setUpdateComment('')
                setCurrentEditComment(null)
                dispatch(setUpdatedComment(res.data.comment))
            } catch (err) {
                toast.error(err.response.data.message || "An error occurred")
            }
        }
        
        async function handleCommentDelete(id) {
            try {
                const res = await axios.delete(`${import.meta.env.VITE_BASE_URL}/blog/comment/${id}`, {headers: {Authorization: `Bearer ${token}`}})            
                if(res.status === 201){
                    toast.success("Comment delted successfully")
                }
                setUpdateComment('')
                setCurrentEditComment(null)
                dispatch(deleteCommentAndReply(id))
            } catch (err) {
                toast.error(err.response.data.message || "An error occurred")
            }
        }
    
  return (
     comment.map((comment,index) => (
        <div key={index} className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 overflow-hidden flex items-center justify-center rounded-full'>
                        <img className='h-full w-full object-cover' src={comment?.user?.profilePic ? comment?.user?.profilePic : `https://api.dicebear.com/9.x/initials/svg?seed=${comment.user.name}`} alt="" />
                    </div>
                    <div className='flex flex-col items-start text-sm'>
                        <h1 className='font-semibold text-sm opacity-85'>{comment.user.name}</h1>
                        <p className='text-xs opacity-55 font-semibold'>{formateDate(comment.createdAt)}</p>
                    </div>
                </div>
                {
                    
                    userId == creatorId || comment.user._id === userId  ? (
                        currentPopup == comment._id ? (
                            <div className='flex flex-col items-start bg-gray-100 text-xs font-medium  rounded-sm cursor-pointer relative pt-3'>
                                <IoIosClose className='absolute right-0 top-0 text-base bg-gray-300 ' onClick={()=>setCurrentPopup((prev)=> prev == comment._id ?  null : comment._id) }/>
                                    {
                                        comment.user._id === userId && <p className=' hover:bg-gray-300 bg-gray-100 px-2 py-1 w-full rounded-sm'  onClick={()=>{ setCurrentEditComment(comment._id); setCurrentPopup(null)} }>Edit</p>
                                    }
                                <p className=' hover:bg-gray-300 bg-gray-100 px-2 py-1 w-full rounded-sm' onClick={()=>{ handleCommentDelete(comment._id); setCurrentPopup(null) }}>Delete</p>
                            </div>
                        ) : (
                            <div className='opacity-75 cursor-pointer'>
                                <BsThreeDots onClick={()=>setCurrentPopup(comment._id)}/>
                            </div>
                        )
                    ) : ""
                    
                }
                
            </div>
            {
                currentEditComment == comment._id ? ( 
                <div className='mb-2 border-b-[1px] pb-2'>
                    <textarea defaultValue={comment.comment} placeholder='What are your thoughts?' className='w-full min-h-24 outline-none pl-3 pt-3 text-sm drop-shadow-md' onChange={(e) => setUpdateComment(e.target.value)}/>
                    <button className='bg-gray-600 hover:bg-gray-800 text-[10px] font-medium mr-2 text-white px-3 py-1 rounded-full' onClick={()=> {handleCommentUpdate(comment._id)}} >EDIT</button>
                    <button className='bg-gray-600 hover:bg-gray-800 text-[10px] font-medium mr-2 text-white px-3 py-1 rounded-full'onClick={() => {setCurrentEditComment(null)}} >CANCEL</button>
                </div>
                ) : (
                <div className='flex  flex-col gap-2'>
                    <div className=''>
                        <p className='text-sm'>{comment.comment}</p>
                    </div>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-6'>
                            <div className='flex items-center gap-1'>
                                {
                                    !comment.likes.includes(userId) ? 
                                    <> 
                                        <BiLike className='text-base cursor-pointer' onClick={() =>handleCommentLike(comment._id)}/>
                                        <p className='text-xs opacity-70 font-medium'>{comment.likes.length}</p>
                                    </> : <>
                                        <BiSolidLike className='text-base cursor-pointer' onClick={() =>handleCommentLike(comment._id)}/>
                                        <p className='text-xs opacity-70 font-medium'>{comment.likes.length}</p>
                                    </> 
                                }
                            </div>
                            <div className='text-sm opacity-80 font-medium flex items-center gap-1 cursor-pointer'>
                                <FaRegComment className='text-base'/>
                                <p className>{comment.replice && comment.replice.length}</p>
                            </div>
                        </div>
                        <div className='text-xs  font-semibold '>
                            <h4 className='cursor-pointer opacity-80 hover:underline hover:opacity-100' onClick={()=> handleActiveReply(comment._id)}>Reply</h4>
                        </div>
                    </div>
                    {
                     activeReply == comment._id && (
                        <div className='mb-3'>
                            <div>
                                <textarea placeholder='Reply...' value={reply} className='w-full min-h-24 border-[1px] border-gray-300 rounded-md outline-none focus:outline-gray-400 focus:outline-1 focus:border-none px-3 pt-3 text-sm drop-shadow-none placeholder:flex' onChange={(e)=> setReply(e.target.value)}/>
                            </div>
                            <div>
                                <button className='bg-gray-600 hover:bg-gray-700 text-[10px] font-medium text-white px-2 py-1 rounded' onClick={() => handleReplyComment(comment._id)}>ADD</button>
                            </div>
                        </div>
                        )
                    }
                    {
                       comment.replice && (comment.replice.length > 0 && (
                        <div className='ml-3'>
                            <div className='pl-4 border-l-2 border-zinc-600 -mt-3 mb-6 flex flex-col' >
                                <DisplayComment comment={comment.replice} userId={userId} token={token} id={id}  creatorId={creatorId} activeReply={activeReply} setActiveReply={setActiveReply}  currentPopup={currentPopup} setCurrentPopup={setCurrentPopup} currentEditComment={currentEditComment} setCurrentEditComment={setCurrentEditComment}/>
                            </div>
                        </div>
                        ))
                    }
                </div>
                )
            }     
        </div>
      )
    )
  )
}

export default DisplayComment