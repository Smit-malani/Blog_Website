import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom'
import { CiSearch } from "react-icons/ci"
import { TfiWrite } from "react-icons/tfi"
import { FaRegUser } from "react-icons/fa6"
import { LiaUserEditSolid } from "react-icons/lia";
import { IoIosLogOut } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../utils/slices/userSlice'


function Navbar() {

  const [isNotific, setIsNotific] = useState(false)
  const location = useLocation()
  const { token, user } = useSelector(slice => slice.user)
  const dispatch = useDispatch()
  const [showPopup, setShowPopup] = useState(false)
  const [searchQuery, setSearchQuery] = useState(null)
  const navigate = useNavigate()

  function handleNotific() {
    if (isNotific) {
      setIsNotific(false)
    } else {
      setIsNotific(true)
    }
  }

  function handleLogout() {
    dispatch(logout())
    setShowPopup(false)
  }


  useEffect(() => {
    if (location.pathname == '/notification') {
      setIsNotific(true)
    } else {
      setIsNotific(false)
    }
  })



  useEffect(() => {
    if (window.location.pathname != '/search') {
      setSearchQuery(null)
    }
    return () => {
      if (window.location.pathname != '/') {
        setShowPopup(false)
      }
    }
  }, [window.location.pathname])

  return (
    <>
      <div className='w-full bg-transparent px-7 sm:px-12 py-4 fixed border-b-[1px] backdrop-blur-sm z-50 border-[#e1e1e1]'>
        <div className='flex items-center justify-between relative'>
          <div className='flex items-center gap-5 max-sm:relative'>
            <Link to={'/'}>
              <h1 className=' text-lg font-bold sm:font-bold sm:uppercase sm:text-2xl'>Postly</h1>
            </Link>
            {
              window.location.pathname != '/create-blog' ? (
                <div className='max-400:absolute max-400:top-14 min-600:block max-400:w-full'>
                  <div className='w-64 bg-[#f1f1f1] py-1 flex items-center rounded-full pl-4 max-400:w-full'>
                    <div className='w-6 h-6 flex items-center justify-center'>
                      <CiSearch className='text-xl text-zinc-500' />
                    </div>
                    <input type='text' placeholder='search' value={searchQuery ? searchQuery : ""} className='w-full px-4 rounded-full outline-none bg-[#f1f1f1] placeholder:text-zinc-500 tracking-wide placeholder:font-medium'
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.code == "Enter") {
                          if (searchQuery.trim()) {
                            navigate(`/search?search=${searchQuery.trim()}`)
                            setSearchQuery('')
                          }
                        }
                      }
                      } />
                  </div>
                </div>
              ) : ""
            }


          </div>
          {
            token ? <div className=' flex items-center gap-5  '>

              <Link to={'/create-blog'} className=' hidden min-600:block'>
                <div className='flex items-center text-zinc-600 gap-2 cursor-pointer hover:text-zinc-800'>
                  <TfiWrite />
                  <p>Write</p>
                </div>
              </Link>
              <div className='h-8 w-8 rounded-full flex items-center cursor-pointer text-zinc-600 justify-center'>
                <div className='h-8 w-8 overflow-hidden flex items-center justify-center rounded-full'>
                  <img className='h-full w-full object-cover' src={user?.profilePic ? user?.profilePic : `https://api.dicebear.com/9.x/initials/svg?seed=${user?.name}`} alt="" onClick={() => setShowPopup(prev => !prev)} />
                </div>
              </div>
            </div>
              :
              <div className='flex items-center gap-2 text-sm'>
                <Link to={'/signup'}>
                  <button className='bg-blue-600 hover:bg-blue-700 text-white px-2 text-xs py-1 rounded-full sm:px-5 sm:py-2 sm:text-sm sm:rounded-full sm:font-semibold'>Sign-Up</button>
                </Link>
                <Link to={'/login'}>
                  <button className='bg-gray-200 hover:bg-gray-300 text-black px-2 py-1 teact-xs rounded-full sm:px-5 sm:py-2 sm:text-sm sm:rounded-full sm:font-semibold'>Log-In</button>
                </Link>
              </div>
          }
          {
            showPopup ? (
              <div className='w-40 bg-white  border absolute right-0 top-14 rounded-sm drop-shadow-md' onMouseLeave={() => setShowPopup(false)}>
                <div >
                  <Link to={`/@${user?.username}`} className=' flex items-center gap-4 border-b-[1px] border-gray-300 px-4 py-2 cursor-pointer' >
                    <FaRegUser className='opacity-80' />
                    <p className='text-sm opacity-80 border-b-[1px] border-white hover:opacity-100 hover:border-b-[1px] hover:border-black'>Profile</p>
                  </Link>
                </div>
                <div className=' '>
                  <Link to={`/edit/profile`} className='flex items-center gap-3 border-b-[1px] border-gray-300 px-4 py-2 cursor-pointer'>
                    <LiaUserEditSolid className=' text-xl opacity-80' />
                    <p className='text-sm opacity-80 border-b-[1px] border-white hover:opacity-100 hover:border-b-[1px] hover:border-black'>Edit Profile</p>
                  </Link>
                </div>
                <div className=' flex items-center gap-3 px-4 py-2 cursor-pointer max-600:border-b-[1px] max-600:border-gray-300'>
                  <IoIosLogOut className='text-xl opacity-80' />
                  <p className='text-sm opacity-80 border-b-[1px] border-white hover:opacity-100 hover:border-b-[1px] hover:border-black' onClick={handleLogout} >Logout</p>
                </div>
                <div className='cursor-pointer min-600:hidden'>
                  <Link to={'/create-blog'} className='flex items-center gap-4 px-4 py-2 cursor-pointer min-600:hidden'>
                    <TfiWrite className=' opacity-80' />
                    <p className='text-sm opacity-80 border-b-[1px] border-white hover:opacity-100 hover:border-b-[1px] hover:border-black'>Write</p>
                  </Link>
                </div>
              </div>
            ) : null
          }
        </div>

      </div>
      <Outlet />
    </>
  )
}

export default Navbar