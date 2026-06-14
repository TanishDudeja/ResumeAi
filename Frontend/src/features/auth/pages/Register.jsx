import React from 'react'
import {useNavigate,Link} from 'react-router'
import {useAuth} from "../hooks/useAuth"
import { useState } from 'react'

const Register=()=> {
  const {handleRegister} = useAuth()
  const navigate = useNavigate()
  const [username, setusername] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const handleSubmit = async(e)=>{
    e.preventDefault()
    const result = await handleRegister({username,email,password})
    if (result && result.success) {
      navigate("/")
    } else {
      alert(result?.error || "Registration failed")
    }
  }
  return (
    
    <main>
      <div className="form-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
            onChange={(e)=>{
                setusername(e.target.value)
            }}
            type="text" id='username' name='username'placeholder='Enter username' />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
            onChange={(e)=>{
              setemail(e.target.value)
            }}
            type="text" id='email' name='email'placeholder='Enter email address' />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
            onChange={(e)=>{
              setpassword(e.target.value)
            }}
            type="password" id='password' name='password'placeholder='Enter password'/>
          </div>

          <button className='button primary-button'>Sign-In</button>
        </form>
        <p>Already have an account <Link to={"/login"}>Login </Link></p>
      </div>
    </main>

  )
}

export default Register
