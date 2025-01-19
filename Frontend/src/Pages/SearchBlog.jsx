import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import DisplayBlogs from '../components/DisplayBlogs'
import toast from 'react-hot-toast'

function SearchBlog() {

    const [searchParams, setSearchParams] = useSearchParams()
    const search = searchParams.get("search")
    const { tag } = useParams()
    const navigate = useNavigate()

    const query = tag ? { tag: tag.replace(" ", "-") } : { search: search } 

    const [page, setpage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const [blogs, setBlogs] = useState([])
    

    useEffect(() => {
        async function searchBlog() {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/search-blogs`, { params: { ...query, page, limit: 5 } })
                setBlogs((prev) => [...prev, ...res.data.blogs])
                setHasMore(res.data.hasMore)
            } catch (err) {
                navigate(-1)
                setBlogs([])
                setHasMore(err.response.data.hasMore)
                toast.error(err.response.data.message)
            }
        }
        searchBlog()
    }, [search, tag, page])


    return (
        <div className='mt-32 flex items-center gap-2 flex-col justify-center'>
            <h1 className=' text-4xl tracking-tight font-bold pb-5 w-[65%] text-center border-b-[1px]'><span className='text-gray-500'>Result For</span> <span className='text-gray-800'>{tag ? tag : search}</span></h1>
            <div className='w-[65%] max-1000:w-full pt-4'>
                <DisplayBlogs blogs={blogs} />
            </div>
            {
                hasMore && <div className='w-full flex items-center justify-center'>
                    <button className='bg-blue-600 w-36 py-2 rounded-full cursor-pointer mt-5 font-medium text-white hover:bg-blue-700' onClick={() => setpage((prev) => prev + 1)}>Load More...</button>
                </div>
            }
        </div>

    )
}

export default SearchBlog