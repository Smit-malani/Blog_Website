import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigationType, useParams } from 'react-router-dom'
import { BiLike } from "react-icons/bi"
import { BiSolidLike } from "react-icons/bi"
import { FaRegComment } from "react-icons/fa6"
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { addSelectedBlog, removeSelectedBlog } from '../utils/slices/selectedBlogSlice'
import Comment from '../components/Comment'
import { setIsOpen } from '../utils/slices/commentSlice'
import { IoSaveOutline } from "react-icons/io5"
import { IoSave } from "react-icons/io5"
import { formateDate } from '../../../Backend/utils/formateDate'



function BlogPage() {

    const { id } = useParams()
    const dispatch = useDispatch()
    const { token, user } = useSelector(slice => slice.user) || {}
    const { isOpen } = useSelector(slice => slice.comment)
    const [blogData, setBlogData] = useState(null)
    const [isLike, setIsLike] = useState(false)
    const { comment, content } = useSelector(slice => slice.currentBlog)
    const [isSaved, setIsSaved] = useState(false)


    async function fetchBlogById() {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/blog/${id}`)
            if (res.status === 200) {
                const data = res.data
                setBlogData(data.blog)
                dispatch(addSelectedBlog(data.blog))

                if (user && res.data.blog.likes.includes(user._id)) {
                    setIsLike(true)
                }
            }
        } catch (err) {
            toast.error(err.response.data.message || "An error occurred")
        }
    }

    async function handleLikeUnlike() {
        try {
            if (token) {
                if (isLike) {
                    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/blog/like/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
                    setIsLike(false)
                    toast.success(res.data.message)
                } else {
                    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/blog/like/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
                    setIsLike(true)
                    toast.success(res.data.message)
                }
                fetchBlogById()
            } else {
                toast.error("Please Sign-in")
            }
        } catch (err) {
            toast.error(err.response.data.message || "An error occurred")
        }
    }

    async function handleSaveBlog(id, token) {
        try {
            const res = await axios.patch(`${import.meta.env.VITE_BASE_URL}/save-blog/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
            setIsSaved(prev => !prev)
            toast.success(res.data.message)
        } catch (err) {
            toast.error(err.response.data.message || "An error occurred")
        }
    }

    async function handleFollowerCreater(id, token) {
        try {
            const res = await axios.patch(`${import.meta.env.VITE_BASE_URL}/follow/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
            toast.success(res.data.message)
        } catch (err) {
            toast.error(err.response.data.message || "An error occurred")
        }

    }

    useEffect(() => {
        fetchBlogById()
        return () => {
            if (window.location.pathname != `/blog/${id}` && window.location.pathname != `/edit/${id}`) {
                dispatch(removeSelectedBlog())
                dispatch(setIsOpen(false))
            }
        }
    }, [])


    return (
        <div className='w-full min-h-screen flex justify-center mt-28 relative max-500:px-4'>
            {
                blogData ? <div className='w-[55%] h-full flex flex-col max-500:w-full'>
                    <div className='title w-full '>
                        <h1 className='font-bold text-4xl opacity-80'>{blogData.title}</h1>
                    </div>
                    <div className='profile flex items-center justify-start w-full mt-8 gap-4'>
                        <Link to={`/@${blogData.creater.username}`}>
                            <div className='h-10 w-10 rounded-full overflow-hidden' >
                                <img className='h-full w-full object-cover' src={blogData.creater.profilePic ? blogData.creater.profilePic : `https://api.dicebear.com/9.x/initials/svg?seed=${blogData?.creater?.name}`} alt="" />
                            </div>
                        </Link>
                        <div className=''>
                            <div className='flex items-center gap-4'>
                                <Link to={`/@${blogData.creater.username}`}>
                                    <h1 className='font-medium opacity-80 cursor-pointer hover:underline'>{blogData?.creater?.name}</h1>
                                </Link>
                                <h1 className='text-[#2B84BD] hover:underline cursor-pointer hover:text-blue-800 capitalize' onClick={() => handleFollowerCreater(blogData?.creater?._id, token)}>{blogData?.creater?.followers?.includes(user?._id) ? "following" : "follow"}</h1>
                            </div>
                            <p className='text-[13px] opacity-60'><span className='font-medium mr-1'>Published Time:</span>{formateDate(blogData?.createdAt)}</p>
                        </div>
                    </div>
                    <div className='w-full h-10  border-t-[1px] border-b-[1px] py-6 border-[#d3d3d3] mt-10 flex items-center justify-start gap-3 px-5'>
                        <div className='flex items-center gap-1 cursor-pointer min-w-10'>
                            {
                                !isLike ? <>
                                    <BiLike className='text-base' onClick={handleLikeUnlike} />
                                    <p className='text-xs opacity-70 font-medium'>{blogData.likes.length}</p>
                                </>
                                    : <>
                                        <BiSolidLike className='text-base' onClick={handleLikeUnlike} />
                                        <p className='text-xs opacity-70 font-medium'>{blogData.likes.length}</p>
                                    </>
                            }
                        </div>
                        <div className='min-w-10 cursor-pointer'>
                            <Link className='flex items-center gap-1' >
                                <FaRegComment className='text-base' onClick={() => dispatch(setIsOpen())} />
                                <p className='text-xs opacity-70 font-medium'>{comment && comment.length}</p>
                            </Link>
                        </div>
                        <div className='cursor-pointer' onClick={(e) => handleSaveBlog(blogData._id, token)}>
                            {
                                blogData?.totalSaves?.includes(user?._id) ? <IoSave /> : <IoSaveOutline />
                            }
                        </div>
                    </div>
                    <div className='w-full h-[60vh] flex items-center justify-center rounded-md overflow-hidden mt-7 max-500:h-[250px]'>
                        <img className='object-cover max-500:h-[200px] max-500:w-[300px] rounded-md' src={blogData.image} alt="" />
                    </div>
                    <div>
                        {
                            content && content.blocks.map((block, index) => {
                                if (block.type == "header") {
                                    if (block.data.level == 1) {
                                        return <h1 className='font-extrabold text-4xl my-3' key={index} dangerouslySetInnerHTML={{ __html: block.data.text }}></h1>
                                    } else if (block.data.level == 2) {
                                        return <h2 className='font-bold text-3xl  my-3' key={index} dangerouslySetInnerHTML={{ __html: block.data.text }}></h2>
                                    } else if (block.data.level == 3) {
                                        return <h3 className='font-semibold text-2xl my-3' key={index} dangerouslySetInnerHTML={{ __html: block.data.text }}></h3>
                                    } else if (block.data.level == 4) {
                                        return <h4 className='font-medium text-xl my-3' key={index} dangerouslySetInnerHTML={{ __html: block.data.text }}></h4>
                                    } else if (block.data.level == 5) {
                                        return <h5 className='font-mediumc text-lg my-3' key={index} dangerouslySetInnerHTML={{ __html: block.data.text }}></h5>
                                    } else if (block.data.level == 6) {
                                        return <h6 className='font-medium text-base my-3' key={index} dangerouslySetInnerHTML={{ __html: block.data.text }}></h6>
                                    }
                                } else if (block.type == "paragraph") {
                                    return <p key={index} dangerouslySetInnerHTML={{ __html: block.data.text }} className=' my-3'></p>
                                } else if (block.type == "image") {
                                    return (
                                        <div key={index} className='text-center'>
                                            <img src={block.data.file.url} alt="" className=' my-3' />
                                            <p className=' capitalize mb-4 -mt-3 font-semibold'>{block.data.caption}</p>
                                        </div>)
                                } else if (block.type == "list") {
                                    return (
                                        <div key={index} className="my-3">
                                            {block.data.style === "ordered" ? (
                                                <ol className="list-decimal pl-5">
                                                    {block.data.items.map((item, itemIndex) => (
                                                        <li
                                                            key={itemIndex}
                                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                                            className="my-1"
                                                        ></li>
                                                    ))}
                                                </ol>
                                            ) : (
                                                <ul className="list-disc pl-5">
                                                    {block.data.items.map((item, itemIndex) => (
                                                        <li
                                                            key={itemIndex}
                                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                                            className="my-1"
                                                        ></li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    );
                                }
                            })
                        }
                    </div>
                    <div className='w-full flex items-center justify-center'>
                        {
                            token && user.email == blogData.creater.email && <Link to={`/edit/${blogData.blogId}`} className='bg-blue-600 hover:bg-blue-700 w-1/3 my-5 text-white font-semibold text-lg rounded-md px-5 py-2 flex items-center justify-center max-500:w-full'>Edit Blog</Link>
                        }
                    </div>
                </div> : <h1>Loading....</h1>
            }
            {
                isOpen && <Comment />
            }
        </div>
    )
}

export default BlogPage