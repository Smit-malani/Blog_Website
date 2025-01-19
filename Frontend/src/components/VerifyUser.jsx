import axios from 'axios'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

function VerifyUser() {
    const {verificationToken} = useParams()
    const navigate = useNavigate()
    useEffect(()=>{
        async function verifyUser(){
           try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/verify-email/${verificationToken}`)
            toast.success(res.data.message)
            navigate('/login')
           } catch (err) {
            toast.error(err.response.data.message || "An error occurred")
           }
        }
        verifyUser()

    },
    [verificationToken])
    
  return (
    <div className='mt-28'>VerifyUser</div>
  )
}

export default VerifyUser