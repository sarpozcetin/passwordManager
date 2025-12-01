import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import axios from 'axios';
import { FaUser } from 'react-icons/fa';
import { FiEye } from 'react-icons/fi';
import { FiEyeOff } from 'react-icons/fi';

/**
 * Login page authenticates user via /auth/login
 * @returns creates session and redirects to /main
 */

const LoginPage = () => {
    // Exponential lockout security
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState(null);
    const isLockedOut = lockoutUntil && Date.now() < lockoutUntil

    useEffect(() => {
        if(lockoutUntil && Date.now() >= lockoutUntil) {
          setFailedAttempts(0);
          setLockoutUntil(null);
        }
    }, [lockoutUntil]);

    const calculateLockout = (attempts) => {
      if(attempts <= 5) {
        return 60000; // 1 minute
      }
      if(attempts <= 10) {
        return 5 * 60000; // 5 minutes
      }
      if(attempts <= 15) {
        return 15 * 60000; // 15 minutes
      }
      if(attempts <= 20) {
        return 60 * 60000; // 1 hours
      }
      return 24 * 60 * 60000; // 24 hours
    }
    


    const [passwordVisible, setPasswordVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    //Toggles the password visibility
    const togglePasswordVisbility = () => setPasswordVisible(!passwordVisible);

    

    //Submit the login, backend validates bcrypt hash
    const handleLogin = async (event) => {
        event.preventDefault();
        if (isLockedOut) {
            const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
            alert(`Too many failed attempts. Try again in ${remaining} seconds.`);
            return;
        }
        if(!password || !username) {
            return alert('Invalid username or password')
        }

        try {
            const response = await axios.post('/auth/login', {
                username,
                password
            },{withCredentials: true});

            setFailedAttempts(0);
            setLockoutUntil(null);

            navigate('/main');
        } catch (err) {
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);

            if(newAttempts >= 5) {
                const duration = calculateLockout(newAttempts);
                setLockoutUntil(Date.now() + duration);
                const mins = Math.floor(duration / 60000);
                alert(`Warning: too many incorrect attempts, locked for ${mins} minute${mins > 1 ? 's' : ''}.`);
            } else {
                alert(`Incorrect password (${newAttempts}/5)`);
            }
            setPassword('');
        }
    };

    return (
        <div className='login-wrapper'>
            <form onSubmit={handleLogin} className='form' autoComplete='off'>
                <h1>Login</h1>

                {/* Username field */}
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

                <button type='submit'>Login</button>
                
                <div className='register-link'>
                    <p>Don't have an account? <a href='/register'>Register</a></p>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
