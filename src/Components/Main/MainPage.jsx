import React, { useState } from 'react';
import './MainPage.css';
import axios from 'axios';
import { FaUser } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const [isEncrypt, setIsEncrypt] = useState(true);
  const navigate = useNavigate();

  const [passwordVisibleEncrypt, setPasswordVisibleEncrypt] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const [decryptAccountName, setDecryptAccountName] = useState('');
  const [decryptedPassword, setDecryptedPassword] = useState(null);

  const [encryptUsername, setEncryptUsername] = useState('');
  const [encryptPassword, setEncryptPassword] = useState('');
  const [encryptAccountName, setEncryptAccountName] = useState('');


  const handleToggle = () => {
    setIsEncrypt((prev) => !prev);
  };

  const togglePasswordVisbilityEncrypt = () => {
    setPasswordVisibleEncrypt(!passwordVisibleEncrypt);
  };

  const toggleConfirmPasswordVisbility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  }

  const handleSignOut = async () => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/auth/logout');
        if (response.status === 200) {
            navigate('/login');
        } else {
            alert('Sign out failed');
        }
    } catch (error) {
        console.error('Error during sign out:', error);
        alert('An error occurred while signing out');
    }
  };

  const onSubmitEncrypt = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/encrypt', {
        username: encryptUsername,
        password: encryptPassword,
        account: encryptAccountName
      }, {withCredentials: true});

      if (response.data.encrypted_password) {
        alert(`Encrypted Password: ${response.data.encrypted_password}`);
      } else {
        alert('Encryption failed.');
      }
    } catch (error) {
      console.error('Error during encryption:', error);
      alert('An error occurred while encrypting.');
    }
  };

  const onSubmitDecrypt = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/decrypt', {
        account: decryptAccountName
      }, {withCredentials:true});

      if (response.data.decrypted_password) {
        setDecryptedPassword(response.data.decrypted_password);
        alert(`Decrypted Password: ${response.data.decrypted_password}`);
      } else {
        alert('Failed to decrypt password.');
      }
    } catch (error) {
      console.error('Error during decryption:', error.response ? error.response.data : error);

      /*console.error('Error during decryption:', error);*/
      alert('An error occurred while decrypting.');
    }
  };

  return (
    <div className="main-container">
      <div className="box-container">
        <div className={`box encrypt ${isEncrypt ? 'visible' : 'hidden'}`}>
          <form onSubmit={onSubmitEncrypt} className='form' autoComplete='off'>
          <div className="input-box">
              <input
                type='text'
                id="encrypt_password"
                value={encryptAccountName}
                onChange={(e) => setEncryptAccountName(e.target.value)}
                required
              />
              <label htmlFor="account">Account</label>
            </div>
            <div className="input-box">
              <input
                type="text"
                id="username"
                value={encryptUsername}
                onChange={(e) => setEncryptUsername(e.target.value)}
                className="encrypt-input"
                required
              />
              <label htmlFor="username" className="encrypt-label">Username</label>
              <FaUser className="icon" />
            </div>

            <div className="input-box">
              <input
                type={passwordVisibleEncrypt ? "text" : "password"}
                id="encrypt_password"
                value={encryptPassword}
                onChange={(e) => setEncryptPassword(e.target.value)}
                required
              />
              <label htmlFor="encrypt_password">Password</label>
              {passwordVisibleEncrypt ? (
                <FiEyeOff className="icon" onClick={togglePasswordVisbilityEncrypt} />
              ) : (
                <FiEye className="icon" onClick={togglePasswordVisbilityEncrypt} />
              )}
            </div>

            <div className="input-box">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                id="confirmpassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <label htmlFor="confirmpassword">Confirm Password</label>
              {confirmPasswordVisible ? (
                <FiEyeOff className="icon" onClick={toggleConfirmPasswordVisbility} />
              ) : (
                <FiEye className="icon" onClick={toggleConfirmPasswordVisbility} />
              )}
            </div>

            
            
            <button type="submit" className="encrypt-button">Submit</button>

          </form>
        </div>

        <div className={`box decrypt ${!isEncrypt ? 'visible' : 'hidden'}`}>
          <form onSubmit={onSubmitDecrypt} className='form' autoComplete='off'>

            <div className="input-box">
              <input
                type="text"
                id="accountname"
                value={decryptAccountName}
                onChange={(e) => setDecryptAccountName(e.target.value)}
                className="decrypt-input"
                required
              />
              <label htmlFor="accountname" className="decrypt-label">Account Name</label>
              <FaUser className="icon" />
            </div>

            <button type="submit" className="decrypt-button">Submit</button>

            <div className="input-box_pw">
              <div className='Password_display'>
                {decryptedPassword ? decryptedPassword : null}
              </div>
            </div>

          </form>
        </div>
      </div>

      <button onClick={handleToggle} className="toggle-button">
        {isEncrypt ? 'Switch to Decrypt' : 'Switch to Encrypt'}
      </button>

      <button onClick={handleSignOut} className="toggle-button">
        Sign Out
      </button>

    </div>
  );
};

export default MainPage;
