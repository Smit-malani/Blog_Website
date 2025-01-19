import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../utils/slices/userSlice';
import { Navigate, useNavigate } from 'react-router-dom';

function EditProfile() {

    const formData = new FormData()
    const { token, user } = useSelector(slice => slice.user) || {}
    const navigate = useNavigate()
    
    if (!token) {
        return <Navigate to={"/signup"} />
    }

    const [isButtonDisabled, setButtonDisabled] = useState(true)

    const dispatch = useDispatch()
    const [initialData, setinitialData] = useState({
        profilePic: user?.profilePic,
        name: user?.name,
        bio: user?.bio,
    })

    const [userData, setuserData] = useState({
        profilePic: user?.profilePic,
        name: user?.name,
        bio: user?.bio
    })

    function handlechange(e) {
        const { name, value, files } = e.target
        if (files) {
            setuserData((prev) => ({ ...prev, [name]: files[0] }))
        } else {
            setuserData((prev) => ({ ...prev, [name]: value }))
        }
    }

    async function handleUpdateProfile() {
        setButtonDisabled(true)

        formData.append("name", userData.name)
        formData.append("bio", userData.bio)
        if (userData.profilePic) {
            formData.append("profilePic", userData.profilePic)
        }

        try {
            const res = await axios.patch(`${import.meta.env.VITE_BASE_URL}/users/details/${user._id}`, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } })
            toast.success(res.data.message)
            dispatch(login({ ...res.data.user, token }))
        } catch (err) {
            toast.error(err.response.data.message || "An error occurred")
        }
    }

    useEffect(() => {
        if (initialData) {
            const isEqule = JSON.stringify(userData) == JSON.stringify(initialData)
            setButtonDisabled(isEqule)
        }
    }, [userData, initialData])

    return (
        <div className='w-full h-full pt-20 flex items-center justify-center bg-gray-50 max-500:mt-16 max-800:px-4'>
            <div className='border-[1px] border-gray-200 bg-white rounded-md w-1/2 flex flex-col items-center gap-1 py-5 max-800:w-full'>
                <div className='w-full relative'>
                    <h1 className='font-bold text-center text-2xl'>Edit Profile</h1>
                    <IoClose className='absolute -top-3 right-3 text-2xl opacity-70 cursor-pointer' onClick={()=> navigate(-1)}/>
                </div>
                <div className=' w-full h-full px-7 flex gap-4 items-end justify-evenly max-500:flex max-500:flex-col max-500:items-center'>
                    <div className='w-[20%] flex flex-col gap-2 max-500:w-full'>
                        <h1 className='text-sm text-gray-800'>Photo</h1>
                        <div className='flex items-center gap-5 h-full w-20'>
                            <div className='h-20 w-20 '>
                                <label htmlFor='image' className='text-base font-medium opacity-80 w-full h-full '>
                                    {
                                        userData?.profilePic ? (
                                            <img className='h-full w-full rounded-full object-cover overflow-hidden' src={typeof userData?.profilePic == "string" ? userData?.profilePic : URL.createObjectURL(userData?.profilePic)} alt="" />
                                        ) : <div className='rounded-full cursor-pointer border-[1px] border-gray-400 flex items-center justify-center text-center bg-gray-50 w-20 h-20'>Photo</div>

                                    }
                                </label>
                                <input id='image' name='profilePic' accept='.png, .jpg, .gif' type='file' className='hidden' onChange={handlechange} />
                            </div>
                        </div>
                    </div>
                    <div className='w-[75%] h-24 flex flex-col justify-around max-500:w-full'>
                        <p className='text-sm text-red-600 cursor-pointer hover:underline' onClick={() => { setuserData((prev) => ({ ...prev, profilePic: null })) }}>Remove</p>
                        <p className='opacity-70 text-sm'>Recommended: Square JPG, PNG, or GIF, at least 1,000 pixels per side.</p>
                    </div>
                </div>
                <div className='flex flex-col w-full px-7 gap-8 mt-7'>
                    <div className='flex flex-col items-start gap-2'>
                        <label htmlFor='name'>Name</label>
                        <input id='name' type='text' name='name' defaultValue={userData.name} placeholder='Enter Name...' className='px-3 py-1 rounded-sm bg-gray-100 border-[1px] border-white focus:outline-none focus:border-black focus:border-[1px] w-full placeholder:text-sm' onChange={handlechange} />
                    </div>
                    <div className='flex flex-col items-start gap-2'>
                        <label htmlFor='bio'>Bio</label>
                        <textarea id='bio' type='text' name='bio' rows={3} defaultValue={userData.bio} placeholder='Short bio...' className='px-3 py-1 rounded-sm bg-gray-100 border-[1px] border-white focus:outline-none focus:border-black focus:border-[1px] w-full placeholder:text-sm' onChange={handlechange} />
                    </div>
                </div>
                <div className='mt-4 w-full flex items-center justify-center gap-5'>
                    <button className='px-3 py-1 rounded-full text-blue-600 font-semibold border-[1px] border-blue-600' onClick={()=> navigate(-1)}>Cancel</button>
                    <button disabled={isButtonDisabled} className={`bg-blue-600 px-3 py-1 rounded-full text-white font-semibold hover:bg-blue-700 ${isButtonDisabled ? 'cursor-not-allowed bg-slate-300 text-gray-800 hover:bg-slate-300' : 'cursor-pointer'}`} onClick={handleUpdateProfile}>Save</button>
                </div>
            </div>
        </div>
    )
}

export default EditProfile