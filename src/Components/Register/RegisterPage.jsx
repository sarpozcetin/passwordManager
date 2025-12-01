import React, { useState } from 'react';
import './RegisterPage.css';
import axios from 'axios';
import { FaUser } from 'react-icons/fa';
import { FiEye } from 'react-icons/fi';
import { FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

/**
 * Registration page that creates a new user with bcrypt hash and a random salt
 * @returns auto logs in and goes to vault
 */
const RegisterPage = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const togglePasswordVisbility = () => setPasswordVisible(!passwordVisible);
    const toggleConfirmPasswordVisbility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

    const handleRegister = async (event) => {
        event.preventDefault();

        //Client side password check to ensure they match
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post('/auth/register', {
                username,
                password
            }, {withCredentials: true});

            if (response.status === 201) {
                alert('Registration successful');
                navigate('/main') // Redirect to main page on successful registration
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Registration failed');
        }
    };

    return (
        <div className='register-wrapper'>
            <form onSubmit={handleRegister} className='form' autoComplete='off'>
                <h1>Sign Up</h1>

                {/*Username field*/}
                <div className='input-box'>
                    <input
                        type='text'
                        id='username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label htmlFor='username'>Username</label>
                    <FaUser className='icon'/>
                </div>

                {/*Password toggle field*/}
                <div className='input-box'>
                    <input
                        type={passwordVisible ? 'text' : 'password'}
                        id='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label htmlFor='password'>Password</label>
                    {passwordVisible ? (
                        <FiEyeOff className='icon' onClick={togglePasswordVisbility} />
                    ) : (
                        <FiEye className='icon' onClick={togglePasswordVisbility} />
                    )}
                </div>
                
                {/*Icon toggles the password visibility*/}
                <div className='input-box'>
                    <input
                        type={confirmPasswordVisible ? 'text' : 'password'}
                        id='confirmpassword'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <label htmlFor='confirmpassword'>Confirm Password</label>
                    {confirmPasswordVisible ? (
                        <FiEyeOff className='icon' onClick={toggleConfirmPasswordVisbility} />
                    ) : (
                        <FiEye className='icon' onClick={toggleConfirmPasswordVisbility} />
                    )}
                </div>

                <button type='submit'>Sign Up</button>

                <div className='register-link'>
                    <p>Already have an account? <a href='/login'>Login</a></p>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;
