import axios from 'axios'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../utils/slices/userSlice'
import { HiOutlineMail } from "react-icons/hi"
import { TbPassword } from "react-icons/tb"
import { IoEyeOutline } from "react-icons/io5"
import { IoEyeOffOutline } from "react-icons/io5"
import { googleAuth } from '../googleAuth/firebase'



function UserLogin() {
    const[user,setUser] = useState({})

    const[email,setEmail] = useState('')
    const[password, setPassword] = useState('')
    const[showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const dispatch = useDispatch()


    async function submitHandler(e){
      e.preventDefault()  
      const userData = {
        email,
        password
      }
      
      try {
        const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`,userData)        
        if(res.status === 200){
          const data = res.data
          setUser(data.user)
          dispatch(login(data.user))
          toast.success("Account Logged-In successfully")
          navigate('/')
        }        
      } catch (err) {
        toast.error(err.response?.data?.message || "An error occurred")
      }
      setEmail('')
      setPassword('')
      
    }

    async function handleGoogleAuth() {
      try {
        let data = await googleAuth()
        const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/google-auth`, {accessToken : data.accessToken})        
        dispatch(login(res.data.user))
        toast.success(res.data.message)
        navigate('/')
      } catch (err) {
        toast.error(err.response.data.message || "An error occurred")
      }
    }

  


    return (
        <div className='w-screen h-screen flex flex-col items-center justify-start mt-28 gap-3'>
          <form onSubmit={(e)=>submitHandler(e)} className='flex flex-col w-full items-center gap-10 lg:w-1/2 md:w-full'>
              <h1 className='text-4xl font-bold'>Login</h1>
              <div className='flex flex-col w-1/2 gap-4'>
              <div className='relative'>
                <HiOutlineMail className='absolute top-1/2 -translate-y-1/2 left-2 opacity-50'/>
                <input onChange={(e)=>setEmail(e.target.value)} required value={email} type='email' placeholder='Enter email' className='px-3 pl-10 w-full py-2 rounded-md focus:outline-none border-2 focus:border-black'/>
              </div>
              <div className='relative'>
                <TbPassword className='absolute top-1/2 -translate-y-1/2 left-2 opacity-50'/>
                <input onChange={(e)=>setPassword(e.target.value)} required value={password} type={(showPassword ? "text" : "password")} placeholder='Enter password' className='px-3 w-full pl-10 py-2 rounded-md focus:outline-none border-2 focus:border-black'/>
                {
                 showPassword ? <IoEyeOutline onClick={()=>setShowPassword(false)} className='absolute top-1/2 -translate-y-1/2 right-2  opacity-50 cursor-pointer'/> : <IoEyeOffOutline onClick={()=> setShowPassword(true)}  className='absolute top-1/2 -translate-y-1/2 right-2 opacity-50 cursor-pointer'/>  
                }
              </div>
                <button className='bg-blue-600 px-3 py-2 rounded-md text-white font-semibold hover:bg-blue-700'>Login</button>
              </div>
              <p className="-my-3 inline-block text-sm font-medium">OR</p>
              <div className='flex items-center justify-center px-6 py-1 rounded-full  bg-slate-200 gap-3 cursor-pointer -m-4 mb-2 hover:bg-slate-300' onClick={handleGoogleAuth}>
                <p className='font-medium uppercase text-sm'>Continue with</p>
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="35" height="35" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              </div>
          </form>
          <p className='text-xs'>Don't have an Account? <Link to={'/signup'} className='font-medium text-blue-600 cursor-pointer underline text-sm'>Create Account</Link></p>
        </div>
      )
}


export default UserLogin