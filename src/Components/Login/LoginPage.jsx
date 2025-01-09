import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { FaUser} from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";




const LoginPage = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const togglePasswordVisbility = () => {
        setPasswordVisible(!passwordVisible);
    }

    const handleLogin = (event) => {
        event.preventDefault();

        if (username && password) {
            navigate('/main');
        } else {
            alert('Please enter required fields');
        }
    }
    return (
        <div className='login-wrapper'>
            <form onSubmit={handleLogin}>
                <h1>Login</h1>
                <div className="input-box">
                    <input type="text" id='username' value={username} onChange={(e) => setUsername(e.target.value)} required/>
                    <label htmlFor="username">Username</label>
                    <FaUser className='icon'/>
                </div>
                <div className="input-box">
                    <input type={passwordVisible ? "text" : 'password'} id='password' value={password} onChange={(e) => setPassword(e.target.value)} required/>
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