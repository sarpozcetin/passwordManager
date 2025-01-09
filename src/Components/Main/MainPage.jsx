import React, {useState} from 'react';
import './MainPage.css';
import { FaUser } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
    const [isEncrypt, setIsEncrypt] = useState(true);
    const navigate = useNavigate();
    const [passwordVisibleEncrypt, setPasswordVisibleEncrypt] = useState(false);
    const [passwordVisibleDecrypt, setPasswordVisibleDecrypt] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const handleToggle = () => {
      setIsEncrypt((prev) => !prev);
    };

    const togglePasswordVisbilityEncrypt = () => {
        setPasswordVisibleEncrypt(!passwordVisibleEncrypt);
    }

    const togglePasswordVisbilityDecrypt = () => {
        setPasswordVisibleDecrypt(!passwordVisibleDecrypt);
    }

    const toggleConfirmPasswordVisbility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    }
    const handleSignOut = () => {
      navigate('/login');
    };

  return (
    <div className="main-container">
      <div className="box-container">
        <div className={`box encrypt ${isEncrypt ? 'visible' : 'hidden'}`}>
          <div className="input-box">
            <input type="text" id="username" className='encrypt-input' required/>
            <label htmlFor="username" className='encrypt-label'>Account Name</label>
            <FaUser className='icon' />
          </div>
          <div className='input-box'>
            <input type={passwordVisibleEncrypt ? "text" : 'password'} id='password' required/>
            <label htmlFor="password">Password</label>
            {passwordVisibleEncrypt ? (<FiEyeOff className='icon' onClick={togglePasswordVisbilityEncrypt} />) :
            <FiEye className='icon' onClick={togglePasswordVisbilityEncrypt} />}
          </div>
          <div className='input-box'>
            <input type={confirmPasswordVisible ? "text" : 'password'} id='confirmpassword' required/>
            <label htmlFor="confirmpassword">Confirm Password</label>
            {confirmPasswordVisible ? (<FiEyeOff className='icon' onClick={toggleConfirmPasswordVisbility} />) :
            <FiEye className='icon' onClick={toggleConfirmPasswordVisbility} />}
          </div>
          <button type='submit' className='encrypt-button'>Submit</button>
        </div>

        <div className={`box decrypt ${!isEncrypt ? 'visible' : 'hidden'}`}>
          <div className="input-box">
            <input type="text" id="accountname" className='decrypt-input' required />
            <label htmlFor="accountname" className='decrypt-label'>Account Name</label>
            <FaUser className='icon' />
          </div>
          <div className="input-box">
            <input type={passwordVisibleDecrypt ? "text" : 'password'} id='password' required/>
            <label htmlFor="password">Password</label>
            {passwordVisibleDecrypt ? (<FiEyeOff className='icon' onClick={togglePasswordVisbilityDecrypt} />) :
            <FiEye className='icon' onClick={togglePasswordVisbilityDecrypt} />}
          </div>
          <button type='submit' className='decrypt-button'>Submit</button>

        </div>
      </div>

      <button onClick={handleToggle} className="toggle-button">
        {isEncrypt ? 'Switch to Decrypt' : 'Switch to Encrypt'}
      </button>
      <button onClick={handleSignOut}className="toggle-button">Sign Out</button>
    </div>
  );
};

export default MainPage;