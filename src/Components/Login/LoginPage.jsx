import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import axios from 'axios';
import { FaUser } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";

const LoginPage = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/auth/login', {
                username,
                password
            });

            if (response.status === 200) {
                navigate('/main');  // Redirect to main page on successful login
            } else {
                alert('Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Invalid username or password');
        }
    };

    const togglePasswordVisbility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className='login-wrapper'>
            <form onSubmit={handleLogin} className='form' autoComplete='off'>
                <h1>Login</h1>
                <div className="input-box">
                    <input
                        type="text"
                        id='username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label htmlFor="username">Username</label>
                    <FaUser className='icon'/>
                </div>
                <div className="input-box">
                    <input
                        type={passwordVisible ? "text" : 'password'}
                        id='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label htmlFor="password">Password</label>
                    {passwordVisible ? (
                        <FiEyeOff className='icon' onClick={togglePasswordVisbility} />
                    ) : (
                        <FiEye className='icon' onClick={togglePasswordVisbility} />
                    )}
                </div>
                <button type='submit'>Login</button>
                <div className='register-link'>
                    <p>Don't have an account? <a href='/register'>Register</a></p>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
