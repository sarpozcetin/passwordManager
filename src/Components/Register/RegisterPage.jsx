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
        <div className='register-wrapper'>
            <form action="">
                <h1>Sign Up</h1>
                <div className="input-box">
                    <input type="text" id='username'required />
                    <label htmlFor='username'>Username</label>
                    <FaUser className='icon' />
                </div>
                
                <div className="input-box">
                    <input type={passwordVisible ? "text" : 'password'} id='password' required/>
                    <label htmlFor="password">Password</label>
                    {passwordVisible ? (<FiEyeOff className='icon' onClick={togglePasswordVisbility} />) :
                    <FiEye className='icon' onClick={togglePasswordVisbility} />}
                </div>
                <div className="input-box">
                    <input type={passwordVisible ? "text" : 'password'} id='confirmpassword' required/>
                    <label htmlFor="confirmpassword">Confirm Password</label>
                    {confirmPasswordVisible ? (<FiEyeOff className='icon' onClick={toggleConfirmPasswordVisbility} />) :
                    <FiEye className='icon' onClick={toggleConfirmPasswordVisbility} />}
                </div>
                <button type='submit'>Sign Up</button>

                <div className='register-link'>
                    <p>Already have an account? <a href='/login'>Login</a></p>
                </div>
            </form>
        </div>
    );
}

export default RegisterPage;
