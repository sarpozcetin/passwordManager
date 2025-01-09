import React, {useState} from 'react';
import './MainPage.css';
//import { FaUser } from "react-icons/fa";
//import { FiEye } from "react-icons/fi";
//import { FiEyeOff } from "react-icons/fi";

const MainPage = () => {
    const [isEncrypt, setIsEncrypt] = useState(true);

    const handleToggle = () => {
      setIsEncrypt((prev) => !prev);
    };

  return (
    <div className="main-container">
      <div className="box-container">
        <div className={`box encrypt-box ${isEncrypt ? 'visible' : 'hidden'}`}>
          <div className="input-box">
            <input type="text" id="encrypt-input" required />
            <label htmlFor="encrypt-input">Add fields to store passwords here</label>
            <button type='submit'>Login</button>
          </div>
        </div>

        <div
          className={`box decrypt-box ${!isEncrypt ? 'visible' : 'hidden'}`}
        >
          <div className="input-box">
            <input type="text" id="decrypt-input" required />
            <label htmlFor="decrypt-input">Add fields to retrieve passwords here</label>
          </div>
        </div>
      </div>

      <button onClick={handleToggle} className="toggle-button">
        {isEncrypt ? 'Switch to Decrypt' : 'Switch to Encrypt'}
      </button>
    </div>
  );
};

export default MainPage;