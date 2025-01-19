import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import toast from "react-hot-toast"
import { useDispatch, useSelector } from 'react-redux'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import EditorjsList from '@editorjs/list'
import NestedList from '@editorjs/nested-list'
import CodeTool from '@editorjs/code'
import Marker from '@editorjs/marker'
import Underline from '@editorjs/underline'
import Embed from '@editorjs/embed'
import TextVariantTune from '@editorjs/text-variant-tune'
import ImageTool from '@editorjs/image'
import { removeSelectedBlog } from '../utils/slices/selectedBlogSlice'
import { setIsOpen } from '../utils/slices/commentSlice'
import { IoCloseOutline } from 'react-icons/io5'


function CreateBlog() {

  const { id } = useParams()

  let { token, user } = useSelector(slice => slice.user)
  const data = useSelector(slice => slice.currentBlog)  

  if (!token) {
    return <Navigate to={"/signup"} />
  }

  const [blog, setBlog] = useState([])
  const [title, setTitle] = useState('')
  const dispatch = useDispatch()
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState([])
  const [tag, setTag] = useState('')
  const [draft, setDraft] = useState(false)

  const editorjfRef = useRef(null)
  const [image, setImage] = useState(null)
  const [content, setContent] = useState('')
  const navigate = useNavigate()


  function initialzedEditorjs() {
    editorjfRef.current = new EditorJS({
      holder: "editorjs",
      placeholder: "Write Somthing",
      data: data.content,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: 'Enter a header'
          }
        },
        list: {
          class: NestedList,
          inlineToolbar: true
        },
        code: CodeTool,
        Marker: {
          class: Marker,
        },
        underline: Underline,
        embed: Embed,
        textVariant: TextVariantTune,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (image) => {
                return {
                  success: 1,
                  file: {
                    url: URL.createObjectURL(image),
                    image
                  }
                }
              }
            }
          }
        }
      },
      tunes: ['textVariant'],
      onChange: async () => {
        let data = await editorjfRef.current.save()
        setContent(data)
      }
    })
  }

  async function submitHandler(e) {
    e.preventDefault()
    const blogData = {
      title,
      description,
      image,
      content,
      tags,
      draft
    }

    if (id) {
      const formData = new FormData()
      formData.append("title", blogData.title)
      formData.append("description", blogData.description)
      formData.append("image", blogData.image)
      formData.append("content", JSON.stringify(blogData.content))
      formData.append("tags", JSON.stringify(blogData.tags))
      formData.append("draft", blogData.draft)
      let existingImages = []

      blogData.content.blocks.forEach((block) => {
        if (block.type == "image") {
          if (block.data.file.image) {
            formData.append("images", block.data.file.image)
          } else {
            existingImages.push({
              url: block.data.file.url,
              imageId: block.data.file.imageId
            })
          }

        }
      })
      formData.append("existingImages", JSON.stringify(existingImages))

      try {
        const res = await axios.patch(`${import.meta.env.VITE_BASE_URL}/blog/${id}`, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } })
        if (res.status === 200) {
          toast.success("Blog Updated successfully")
          setBlog(data.blog)
          navigate('/')
        }
      } catch (err) {
        toast.error(err.response.data.message || "An error occurred")
      }
    } else {
      try {
        const formData = new FormData()
        formData.append("title", blogData.title)
        formData.append("description", blogData.description)
        formData.append("image", blogData.image)
        formData.append("content", JSON.stringify(blogData.content))
        formData.append("tags", JSON.stringify(blogData.tags))
        formData.append("draft", blogData.draft)

        blogData.content.blocks.forEach((block) => {
          if (block.type == "image") {
            formData.append("images", block.data.file.image)
          }
        })

        const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/blog`, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } })
        if (res.status === 201) {
          const data = res.data
          setBlog(data.blog)
          toast.success("Blog created successfully")
          navigate('/')
        }else if(res.status === 200){
          const data = res.data
          toast.success(data.message || "Blog Draft successfully")
          navigate('/')
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "An error occurred Or Refresh Page")
      }
    }
    setTitle('')
    setDescription('')
    setContent('')
    setTags([])
    setDraft(draft)
  }

  async function fetchBlogById() {
    setTitle(data.title)
    setDescription(data.description)
    setImage(data.image)
    setContent(data.content)
    setTags(data.tags)
    setDraft(data?.draft)
  }

  function deleteTag(index) {
    const updatedTages = tags.filter((_, tagIndex) => tagIndex != index)
    setTags(updatedTages)
  }

  function handleKeyDown(e) {
    if (e.code == "Enter") {
      e.preventDefault()
      if (tags.length >= 10) {
        return toast.error("You can add upto 10 Tag's")
      }
      if(tags.includes(tag)){
        return toast.error("This tag is alredy added")
      }
      if (tag.trim() !== "") {
        setTags((prev) => [...prev, tag.trim()])
        setTag("")
      }
    }
  }

  useEffect(() => {
    if (id) {
      fetchBlogById()
    }
  }, [id])

  useEffect(() => {
    if (editorjfRef.current == null) {
      initialzedEditorjs()
    }
    return () => {
      editorjfRef.current == null
      if (window.location.pathname != `/blog/${id}` && window.location.pathname != `/edit/${id}`) {
        dispatch(removeSelectedBlog())
        dispatch(setIsOpen(false))
        setTitle('')
        setDescription('')
        setImage('')
      }
    }

  }, [])

  return (
    <div className='w-screen h-screen flex items-start mt-28  justify-center '>
      <form onSubmit={(e) => submitHandler(e)} className='flex flex-col w-full items-center gap-5 lg:w-1/2 md:w-[70%] max-500:w-[80%] max-800:w-[80%] pb-5'>
        <h1 className='text-4xl font-bold'>{id ? "Edit Blog" : "Create Blog"}</h1>
        <div className='flex flex-col w-full max-500:w-full gap-5'>
          <div className=' lg:flex lg:justify-between lg:items-start lg:gap-2 '>
            <div className=' lg:flex lg:flex-col lg:w-[60%] flex flex-col gap-5 '>
              <div className='flex flex-col items-start gap-1 w-full'>
                <label htmlFor='title' className='text-base font-medium opacity-80'>Title:</label>
                <input id='title' onChange={(e) => setTitle(e.target.value)} value={title} type='text' placeholder='Enter Blog Title' className='px-3 py-2 rounded-md focus:outline-none border-2 focus:border-black w-full' />
              </div>
              <div className='flex flex-col items-start gap-1'>
                <label htmlFor='tag' className='text-base font-medium opacity-80'>Tag:</label>
                <input id='tag' value={tag} type='text' placeholder="Enter Tag's" className='px-3 py-2 rounded-md focus:outline-none border-2 focus:border-black w-full' onChange={(e) => setTag(e.target.value)} onKeyDown={handleKeyDown} />
                <div className='flex items-center justify-between w-full my-1'>
                  <p className='text-xs opacity-50'>*Click on Enter to add Tag</p>
                  <p className='text-xs opacity-50'>{10 - tags.length} Tag's Remaining</p>
                </div>
                <div className='flex gap-2 items-center font-medium opacity-80 flex-wrap'>
                  {
                    tags?.map((tag, index) => (
                      <div key={index} className='bg-gray-100 pl-3 pr-2 py-1 text-center rounded-md flex items-center gap-1 hover:bg-blue-700 hover:text-white'>
                        <p className='text-sm leading-none'>{tag}</p>
                        <IoCloseOutline className='text-base cursor-pointer mt-1 rounded-full px-[1px] py-[1px] hover:bg-white hover:text-black ' onClick={() => deleteTag(index)} />
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            <div className='flex flex-col justify-center items-center mt-5 h-96 lg:h-40 lg:w-60 max-500:h-56'>
              <label htmlFor='image' className='text-base font-medium opacity-80 w-full h-full'>
                {
                  image ? (
                    <img className='object-cover rounded-xl w-full h-full' src={typeof (image) == "string" ? image : URL.createObjectURL(image)} alt="" />
                  ) : (
                    <div className='rounded-xl border-[1px] border-dashed border-black flex items-center justify-center bg-white h-full'>
                      Select Thubnail
                    </div>
                  )
                }
              </label>
              <input id='image' onChange={(e) => setImage(e.target.files[0])} type='file' className='hidden' />
            </div>
          </div>

          <div className='flex flex-col items-start gap-1'>
            <label htmlFor='desc' className='text-base font-medium opacity-80'>Description:</label>
            <input id='desc' onChange={(e) => setDescription(e.target.value)} value={description} type='text' placeholder='Enter Blog Description' className='px-3 py-2 rounded-md focus:outline-none border-2 focus:border-black w-full' />
          </div>
          <div id='editorjs' className='bg-gray-50 border-2 rounded-md min-h-[60vh] pt-3 w-full px-4'>

          </div>
        </div>
        <div className='w-full'>
          <h1 className='text-base font-medium opacity-80'>Draft :</h1>
          <select value={draft} className='px-3 py-2 rounded-md focus:outline-none border-2 focus:border-black w-full' onChange={(e) => setDraft(e.target.value == "true" ? true : false)}>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
        <button className='bg-blue-600 px-3 py-2 rounded-md text-white font-semibold hover:bg-blue-700'>
          {draft ? "Save as Draft" : id ? "Update Blog" : "Post Blog"}
        </button>
      </form>
    </div>
  )
}

export default CreateBlog