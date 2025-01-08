import React, {useState} from 'react';
import './RegisterPage.css';
import { FaUser } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";

const RegisterPage = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);


    const togglePasswordVisbility = () => {
        setPasswordVisible(!passwordVisible);
    }

    const toggleConfirmPasswordVisbility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    }

    return (
        <div className='wrapper'>
            <form action="">
                <h1>Register</h1>
                <div className="input-box">
                    <input type="text" placeholder='Username' required />
                    <FaUser className='icon' />
                </div>
                
                <div className="input-box">
                <input type={passwordVisible ? "text" : 'password'} placeholder='Password' required/>
                    {passwordVisible ? (<FiEyeOff className='icon' onClick={togglePasswordVisbility} />) :
                    <FiEye className='icon' onClick={togglePasswordVisbility} />}
                </div>
                <div className="input-box">
                <input type={confirmPasswordVisible ? "text" : 'password'} placeholder='Confirm Password' required/>
                    {confirmPasswordVisible ? (<FiEyeOff className='icon' onClick={toggleConfirmPasswordVisbility} />) :
                    <FiEye className='icon' onClick={toggleConfirmPasswordVisbility} />}
                </div>
                <button type='submit'>Register</button>

                <div className='register-link'>
                    <p>Already have an account? <a href='/login'>Login</a></p>
                </div>
            </form>
        </div>
    );
}

export default RegisterPage;
