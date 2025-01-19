import axios from 'axios'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DisplayBlogs from './DisplayBlogs'
import { Link } from 'react-router-dom'
function Home() {

    const [blogs, setBlogs] = useState([])
    const [page, setpage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    async function fetchBlogs() {
        const params = { page, limit: 5 }
        try {
            let res = await axios.get(`${import.meta.env.VITE_BASE_URL}/blogs`, {params})
            if (res.status === 200) {
                const data = res.data
                setBlogs((prev) => [...prev, ...data.blog])
                setHasMore(res.data.hasMore)
            }
        } catch (err) {            
            toast.error(err?.response?.data?.message || "An error occurred")
        }
    }
    useEffect(() => {
        fetchBlogs()
    }, [page])
    return (
        <div className='flex'>
            <div className='mt-36 min-h-full w-full border-r lg:w-[65%]'>
                {
                    blogs.length > 0 && <DisplayBlogs blogs={blogs} />

                }
                {
                    hasMore && <div className='w-full flex items-center justify-center'>
                        <button className='bg-blue-600 w-36 py-2 rounded-full cursor-pointer mt-5 font-medium text-white hover:bg-blue-700' onClick={() => setpage((prev) => prev + 1)}>Load More...</button>
                    </div>
                }

            </div>
            <div className='hidden pt-28 h-screen fixed right-0 lg:w-[35%] lg:block'>
                <div className='px-8'>
                    <h1 className='text-2xl font-bold text-gray-700'>Recommended Topic's</h1>
                    <div className='flex gap-2 items-center font-medium opacity-80 flex-wrap mt-5'>
                        {
                            ["Data Science", "Writing", "Technology", "react", "Relationships", "Politics", "Programming", "Self Improvement"]?.map((tag, index) => (
                                <Link to={`/tag/${tag}`} key={index}>
                                    < div key={index} className='bg-gray-200 px-4 py-3 text-center rounded-full cursor-pointer hover:bg-blue-700 hover:text-white my-2' >
                                        <p className='text-sm leading-none'>{tag}</p>
                                    </div>
                                </Link>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div >

    )
}

export default Home