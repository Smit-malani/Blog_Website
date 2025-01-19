import React from 'react'
import { AiOutlineLike } from 'react-icons/ai'
import { FaRegComment } from 'react-icons/fa6'
import { GiStarShuriken } from 'react-icons/gi'
import { Link } from 'react-router-dom'
import { formateDate } from '../../../Backend/utils/formateDate'

function DisplayBlogs({ blogs }) {
    
    return (
        <div className=' max-700:flex max-700:justify-evenly px-6 max-700:flex-wrap max-600:flex max-600:flex-col max-600:items-center max-600:justify-center max-600:w-[100vw] max-600:gap-10'>
            {
               blogs?.length > 0 ? 
               blogs?.map((blog, index) => {
                    return (
                        <Link key={index} to={`/blog/${blog.blogId }`}>
                            <div className='border-b-[1px] border-[#e1e1e1] mb-3 pb-9 flex items-center justify-center gap-3 max-700:border-none max-700:w-[40vw] max-700:h-80 max-600:min-w-[100vw] max-600:pr-16 max-600:mt-10'>
                                <div className='flex items-center justify-between w-[70vw] px-12 max-700:flex max-700:flex-col-reverse max-700:justify-center max-700:px-0 max-700:w-full max-600:w-[90%] max-600:border-b-2 max-600:pb-5'>
                                    <div className='flex flex-col justify-start items-start gap-4 max-700:gap-0 max-700:w-[80%] max-600:min-w-full'>
                                        <div className='flex items-center gap-3 cursor-pointer'>
                                            <div className='h-7 w-7 overflow-hidden rounded-full max-700:my-2'>
                                                <img className='h-full w-full object-cover' src={blog?.creater?.profilePic ? blog?.creater?.profilePic : `https://api.dicebear.com/9.x/initials/svg?seed=${blog?.creater?.name}`} alt="" />
                                            </div>
                                            <h2 className='text-sm'>{blog?.creater?.name}</h2>
                                        </div>
                                        <div className='cursor-pointer mr-6'>
                                            <h1 className='font-bold text-2xl min-w-5/6 line-clamp-1 '>{blog?.title}</h1>
                                            <p className='opacity-80 max-w-96 line-clamp-2 min-h-11 leading-tight my-2'>{blog?.description}{blog?.description}{blog?.description}{blog?.description}{blog?.description}{blog?.description}{blog?.description}</p>
                                        </div>
                                        <div className='flex items-center justify-start gap-7 '>
                                            <div className='flex items-center gap-2'>
                                                <GiStarShuriken className='text-base text-yellow-500' />
                                                <p className='text-xs opacity-70 font-medium'>{formateDate(blog?.createdAt)}</p>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <AiOutlineLike className='text-base' />
                                                <p className='text-xs opacity-70 font-medium'>{blog?.likes?.length}</p>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <FaRegComment className='text-base' />
                                                <p className='text-xs opacity-70 font-medium'>{blog?.comment?.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='w-[20vw] max-700:w-full max-700:flex max-700:items-center max-700:justify-center'>
                                        <div className='bg-gray-100 h-32 w-56 overflow-hidden object-cover rounded-sm cursor-pointer  max-700:h-[20vw] max-700:w-[33vw] max-700:overflow-hidden max-600:min-h-[40vw] max-600:min-w-full'>
                                            <img className='h-full w-full object-cover' src={blog?.image} alt="" />
                                         </div>
                                    </div>

                                </div>
                            </div>
                        </Link>
                    )
                }) : <h1 className=' font-bold text-2xl text-gray-700 text-center'>No Data Found</h1>
            }
        </div>
    )
}

export default DisplayBlogs