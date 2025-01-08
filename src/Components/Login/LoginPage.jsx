import React, { useState} from 'react';
import './LoginPage.css';
import { FaUser} from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";




const LoginPage = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisbility = () => {
        setPasswordVisible(!passwordVisible);
    }

    return (
        <div className='login-wrapper'>
            <form action="">
                <h1>Login</h1>
                <div className="input-box">
                    <input type="text" id='username' required/>
                    <label htmlFor="username">Username</label>
                    <FaUser className='icon'/>
                </div>
                <div className="input-box">
                    <input type={passwordVisible ? "text" : 'password'} id='password' required/>
                    <label htmlFor="password">Password</label>
                    {passwordVisible ? (<FiEyeOff className='icon' onClick={togglePasswordVisbility} />) :
                    <FiEye className='icon' onClick={togglePasswordVisbility} />}
                </div>

                <button type='submit'>Login</button>

                <div className='register-link'>
                    <p>Don't have an account? <a href='/Register'>Register</a></p>
                </div>
            </form>

        </div>
    )
}

export default LoginPage;