import { Route, Routes } from 'react-router-dom'
import './App.css'
import UserSignup from './Pages/UserSignup'
import Home from './components/Home'
import UserLogin from './Pages/UserLogin'
import CreateBlog from './components/CreateBlog'
import Navbar from './components/Navbar'
import BlogPage from './Pages/BlogPage'
import VerifyUser from './components/VerifyUser'
import ProfilePage from './Pages/ProfilePage'
import EditProfile from './Pages/EditProfile'
import SearchBlog from './Pages/SearchBlog'

function App() {

  return (
    <div className='bg-white w-screen h-screen overflow-x-hidden'>
      <Routes>
        <Route path='/' element={<Navbar />}>
          <Route path='/' element={<Home />}></Route>
          <Route path='/signup' element={<UserSignup />}></Route>
          <Route path='/login' element={<UserLogin />}></Route>
          <Route path='/create-blog' element={<CreateBlog />}></Route>
          <Route path='/blog/:id' element={<BlogPage />}></Route>
          <Route path='/search' element={<SearchBlog />}></Route>
          <Route path='/tag/:tag' element={<SearchBlog />}></Route>
          <Route path='/edit/:id' element={<CreateBlog />}></Route>
          <Route path='/verify-email/:verificationToken' element={<VerifyUser />}></Route>
          <Route path='/:username' element={<ProfilePage />}></Route>
          <Route path='/:username/saved-blog' element={<ProfilePage />}></Route>
          <Route path='/:username/draft-blog' element={<ProfilePage />}></Route>
          <Route path='/edit/profile' element={<EditProfile />}></Route>
        </Route>
      </Routes>
    </div>
  )
}

export default App
