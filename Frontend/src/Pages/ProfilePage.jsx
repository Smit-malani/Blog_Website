import axios from 'axios'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import DisplayBlogs from '../components/DisplayBlogs'

function ProfilePage() {

  const { username } = useParams()
  const [userData, setuserData] = useState(null)
  const { token, user } = useSelector(slice => slice.user) || {}
  const location = useLocation()

  async function fetchUserData(username) {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/${username.split("@")[1]}`)
      setuserData(res.data.user)
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

  function renderComponents() {
    if (location.pathname == `/${username}`) {
      return <DisplayBlogs blogs={userData?.blogs.filter((blog) => !blog.draft)} />
    } else if (location.pathname == `/${username}/saved-blog`) {
      return <DisplayBlogs blogs={userData?.savedBlogs} />
    } else if (location.pathname == `/${username}/draft-blog`) {
      return (
        <>
          {
            user?._id == userData?._id ? <DisplayBlogs blogs={userData?.blogs.filter((blog) => blog.draft)} /> : <Navigate to={`/${username}`} />
          }
        </>
      )
    }
  }

  useEffect(() => {
    fetchUserData(username)
  }, [username])


  return (

    <div className='mt-16 flex items-start max-600:flex max-600:flex-col-reverse'>
      <div className='w-full pt-6 min-h-screen px-5 pr-12 mt-56 min-600:mt-10 min-600:w-2/3 min-600:border-r-[1px]'>
        <div className='mt-10 hidden min-600:block'>
          {
            userData ? (
              <h1 className='text-5xl font-semibold capitalize opacity-80 '>{userData?.name}</h1>
            ) : <h1>Loading....</h1>
          }
        </div>

        <div className='flex items-center border-b-[1px] mb-5 pt-10 pb-5'>
          <nav>
            <ul className='flex items-center gap-4'>
              <li className='opacity-80 text-sm  hover:text-opacity-100 hover:underline cursor-pointer'>
                <Link to={`/${username}`} className={`${location.pathname == `/${username}` ? "text-blue-600" : ""}`}>
                  Home
                </Link>
              </li>
              <li className='opacity-80 text-sm hover:text-opacity-100 hover:underline cursor-pointer'>
                <Link to={`/${username}/saved-blog`} className={`${location.pathname == `/${username}/saved-blog` ? "text-blue-600" : ""}`}>
                  Saved Blog
                </Link>
              </li>
              {
                userData?._id == user?._id ? (<li className='opacity-80 text-sm hover:text-opacity-100 hover:underline cursor-pointer'>
                  <Link to={`/${username}/draft-blog`} className={`${location.pathname == `/${username}/draft-blog` ? "text-blue-600" : ""}`}>
                    Draft Blog
                  </Link>
                </li>) : ""
              }

            </ul>
          </nav>
        </div>
        <div className='overflow-hidden pr-10'>
          {
            renderComponents()
          }
        </div>
      </div>
      <div>
        <div className='pt-20 px-4 h-[85vh] fixed right-0 max-600:w-full max-600:top-0 max-600:h-80 max-600:border-[1px] max-600:bg-white min-600:w-1/3 min-600:pt-3'>
          <div className=''>
            {
              userData ? (
                <div className='flex flex-col items-start gap-4 '>
                  <div className='h-20 w-20 rounded-full overflow-hidden bg-gray-200'>
                    <img className='h-full w-full object-cover' src={userData?.profilePic ? userData?.profilePic : `https://api.dicebear.com/9.x/initials/svg?seed=${userData?.name}}`} />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <h1 className='font-semibold text-lg'>{userData?.name}</h1>
                    <p className='font-medium text-gray-500'>{userData?.followers?.length} Followers</p>
                  </div>
                  <div className=''>
                    <p className='text-sm text-gray-500 text-justify'>{userData?.bio}</p>
                  </div>
                  <div className='max-600:w-full pr-5'>
                    {user?._id == userData._id ? (
                      <Link to={`/edit/profile`}>
                        <button className='px-4 py-1 bg-blue-600 font-medium text-white rounded-full text-sm hover:bg-blue-700 max-600:w-full'>
                          Edit Profile
                        </button>
                      </Link>
                    ) : (
                      <button className='px-4 py-1 bg-blue-600 font-medium text-white rounded-full text-sm hover:bg-blue-700' onClick={() => handleFollowerCreater(userData?._id, token)}>
                        Follow
                      </button>
                    )}


                  </div>
                </div>
              ) : <h1>Loading....</h1>
            }

          </div>
          <div className='mt-10 max-600:hidden'>
            <h2 className='font-medium'>Following</h2>
            <div className='h-44 overflow-y-scroll'>
              {
                userData?.following.map((user, index) => (
                  <Link key={index} to={`/@${user.username}`}>
                    <div className='flex items-center gap-3 mt-3'>
                      <div className='h-8 w-8 rounded-full overflow-hidden bg-gray-200'>
                        <img className='h-full w-full object-cover' src={user?.profilePic ? user?.profilePic : `https://api.dicebear.com/9.x/initials/svg?seed=${user?.name}}`} />
                      </div>
                      <p className='text-base hover:underline cursor-pointer'>{user?.name}</p>
                    </div>
                  </Link>
                ))
              }
            </div>





          </div>
        </div>
      </div>

    </div>
  )
}

export default ProfilePage