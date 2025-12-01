import React, { useState, useEffect } from 'react';
import './MainPage.css';
import axios from 'axios';
import { FiUser, FiEye, FiEyeOff, FiPlus, FiCopy, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { deriveKey, encryptPassword, decryptPassword } from '../../crypt';

/**
 * The main page acts as the core vault interface
 * Features: Add new user, show/hide toggles, Copy, Delete, auto-locking
 * All encryption/decryption happens in the browser
 * @returns List of users accounts and passwords
 */
const MainPage = () => {
  const navigate = useNavigate();

  //Global salt which is cleared on a user logout
  let userSalt = null;

  // State Management
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form fields
  const [encryptAccountName, setEncryptAccountName] = useState('');
  const [encryptUsername, setEncryptUsername] = useState('');
  const [plainPassword, setPlainPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisibleEncrypt, setPasswordVisibleEncrypt] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Revealed passwords limited to one at a time for security
  const [revealedPasswords, setRevealedPasswords] = useState({}); // 

  const [cryptoKey, setCryptoKey] = useState(null);

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

  // Auto-locks the application after 20 minutes of inactivity
  useEffect(() => {
    if (unlocked) {
      const timer = setTimeout(() => {
        setCryptoKey(null);
        setUnlocked(false);
        alert('Inactivity detected: vault auto-locked, please unlock again');
      }, 1200000); //1200000ms = 20 minutes
      return () => clearTimeout(timer);
    }
  }, [unlocked]);

  // Unlocks the vault and derives the key and load encrypted entries
  const unlockVault = async () => {
    if (isLockedOut) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      alert(`Too many failed attempts. Try again in ${remaining} seconds.`);
      return;
    }

    if (!masterPassword) {
      return alert('Enter master password');
    }

    try {
      const saltRes = await axios.get('/auth/salt', { withCredentials: true });
      userSalt = saltRes.data.salt;
      const testKey = await deriveKey(masterPassword, userSalt);
      const vaultRes = await axios.get('/api/vault', { withCredentials: true });

      if (vaultRes.data.length === 0) {
        setCryptoKey(testKey);
        setEntries([]);
        setUnlocked(true);
        setFailedAttempts(0);
        setLockoutUntil(null);
        return;
      }

      const testEntry = vaultRes.data[0];
      await decryptPassword(testEntry.encrypted_password, testEntry.iv, testKey);

      setCryptoKey(testKey);
      setEntries(vaultRes.data);
      setUnlocked(true);
      setFailedAttempts(0);
      setLockoutUntil(null);

    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        const duration = calculateLockout(newAttempts);
        setLockoutUntil(Date.now() + duration);
        const mins = Math.floor(duration / 60000);
        alert(`Warning: too many incorrect attempts, locked for ${mins} minute${mins > 1 ? 's' : ''}.`);
      } else {
        alert(`Incorrect password (${newAttempts}/5)`);
      }
      setMasterPassword('');
    }
  };

  // Saves a new password which is encrypted client-side before sending
  const savePassword = async (e) => {
    e.preventDefault();
    if (plainPassword !== confirmPassword) {

     return alert('Passwords do not match');
    }

    const currentKey = cryptoKey;
    if (!currentKey) {
      return setUnlocked(false);
    }

    try {
      const { encrypted, iv } = await encryptPassword(plainPassword, currentKey);
      const res = await axios.post('/api/vault', {
        account: encryptAccountName,
        username: encryptUsername,
        encrypted_password: encrypted,
        iv
      }, { withCredentials: true });

      const newEntry = {
        _id: res.data._id,
        account: res.data.account,
        username: res.data.username,
        encrypted_password: encrypted,
        iv
      };

      setEntries(prev => [...prev, newEntry]);
      setShowAddForm(false);
      alert('Password securely saved');

      // Reset the form
      setEncryptAccountName('');
      setEncryptUsername('');
      setPlainPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      alert('Save failed — re-unlocking required');
      setCryptoKey(null);
      setUnlocked(false);
    }
  };

  // Toggle reveal/hide password (only one visible at a time)
  const toggleReveal = async (entry) => {
    if (revealedPasswords[entry._id]) {
      // Already shown → hide it
      setRevealedPasswords(prev => {
        const newState = { ...prev };
        delete newState[entry._id];
        return newState;
      });
      return;
    }

    //Clear all the previous passwords before revealing the next
    setRevealedPasswords({});
    if (!cryptoKey) { 
      return setUnlocked(false);
    }

    try {
      const plain = await decryptPassword(entry.encrypted_password, entry.iv, cryptoKey);
      setRevealedPasswords({ [entry._id]: plain });
    } catch (err) {
      alert('Decryption failed — session expired');
      setUnlocked(false);
    }
  };

  // Deletes the chosen password
  const deleteEntry = async (entryId) => {
    const masterPass = window.prompt('Enter your master password to confirm deletion');

    //The user cancelled or did not enter anything
    if (!masterPass || masterPass.trim() === '') {
      return;
    }

    //Re-derive the key to verify if the password is correct
    try {
      const res = await axios.get('/auth/salt', { withCredentials: true });
      const salt = res.data.salt;
      await deriveKey(masterPass, salt); // This will throw if password is wrong
    } catch (err) {
      alert('Incorrect master password: Deletion cancelled');
      return;
    }

    //The master password was confirmed and can proceed with deletion
    if (!window.confirm('Delete this password permanently?'))  {
      return;
    }

    try {
      await axios.delete(`/api/vault/${entryId}`, { withCredentials: true });
      setEntries(prev => prev.filter(e => e._id !== entryId));
      setRevealedPasswords(prev => {
        const newState = { ...prev };
        delete newState[entryId];
        return newState;
      });
      alert('Password deleted');
    } catch (err) {
      alert('Delete failed');
    }
  };

  //Copies the password to the clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  //Signs the user out and redirects to the login page
  const handleSignOut = async () => {
    try {
      await axios.post('/auth/logout', {}, { withCredentials: true });
    } catch (err) {
      console.warn('Logout failed');
    }
    setCryptoKey(null);
    userSalt = null;
    setUnlocked(false);
    setEntries([]);
    setRevealedPasswords({});
    navigate('/login');
  };

  // Vault unlock screen
  if (!unlocked) {
    return (
      <div className='main-container unlock-screen'>
        <div className='box-container'>
          <div className='box encrypt visible'>
            <form className='form' onSubmit={(e) => { e.preventDefault(); unlockVault(); }}>
              <h2>Unlock Your Vault</h2>
              <div className='input-box'>
                <input
                  type={showMasterPassword ? 'text' : 'password'}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  required
                  autoFocus
                />
                <label>Master Password</label>
                {showMasterPassword ? (
                  <FiEyeOff className='icon' onClick={() => setShowMasterPassword(false)} />
                ) : (
                  <FiEye className='icon' onClick={() => setShowMasterPassword(true)} />
                )}
              </div>
              <button type='submit' className='encrypt-button'>Unlock Vault</button>
            </form>
          </div>
        </div>
        <button onClick={handleSignOut} className='toggle-button'>Sign Out</button>
      </div>
    );
  }

  // Vault Screen
  return (
    <div className='main-container vault-screen'>
      <div className='vault-header'>
        <h2>My Passwords ({entries.length})</h2>
        <button onClick={() => setShowAddForm(true)} className='toggle-button'>
          <FiPlus className='icon-plus' /> Add New
        </button>
      </div>

      {/* Add Modal */}
      {showAddForm && (
        <div className='add-modal' onClick={() => setShowAddForm(false)}>
          <div className='modal-box' onClick={(e) => e.stopPropagation()}>
            <form onSubmit={savePassword} className='form'>
              <h3>Add New Password</h3>
              <div className='input-box'>
                <input type='text' value={encryptAccountName} onChange={e => setEncryptAccountName(e.target.value)} required />
                <label>Account</label>
              </div>
              <div className='input-box'>
                <input type='text' value={encryptUsername} onChange={e => setEncryptUsername(e.target.value)} />
                <label>Username</label>
                <FiUser className='icon' />
              </div>
              <div className='input-box'>
                <input
                  type={passwordVisibleEncrypt ? 'text' : 'password'}
                  value={plainPassword}
                  onChange={e => setPlainPassword(e.target.value)}
                  required
                />
                <label>Password</label>
                {passwordVisibleEncrypt ? (
                  <FiEyeOff className='icon' onClick={() => setPasswordVisibleEncrypt(false)} />
                ) : (
                  <FiEye class='icon' onClick={() => setPasswordVisibleEncrypt(true)} />
                )}
              </div>
              <div className='input-box'>
                <input
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <label>Confirm Password</label>
                {confirmPasswordVisible ? (
                  <FiEyeOff class='icon' onClick={() => setConfirmPasswordVisible(false)} />
                ) : (
                  <FiEye class='icon' onClick={() => setConfirmPasswordVisible(true)} />
                )}
              </div>
              <div className='form-buttons'>
                <button type='submit' className='encrypt-button'>Save</button>
                <button type='button' onClick={() => setShowAddForm(false)} className='cancel-button'>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password List */}
      <div className='accounts-list'>
        {entries.length === 0 ? (
          <p className='no-entries'>No passwords yet. Click 'Add New' to begin.</p>
        ) : (
          entries.map(entry => (
            <div key={entry._id} className='account-card'>
              <div className='account-info'>
                <FiUser className='account-icon' />
                <div>
                  <div className='account-name'>{entry.account}</div>
                  <div className='account-username'>{entry.username || '—'}</div>
                </div>
              </div>

              <div className='account-actions'>
                {/* Show/hide buttons */}
                {revealedPasswords[entry._id] ? (
                  <>
                    <span className='revealed-password'>{revealedPasswords[entry._id]}</span>
                    <button onClick={() => copyToClipboard(revealedPasswords[entry._id])} className='copy-btn'>
                      <FiCopy />
                    </button>
                    <button onClick={() => toggleReveal(entry)} className='show-btn'>
                      <FiEyeOff />
                    </button>
                  </>
                ) : (
                  <button onClick={() => toggleReveal(entry)} className='show-btn'>
                    <FiEye />
                  </button>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => deleteEntry(entry._id)}
                  className='delete-btn'
                  title='Delete permanently'
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button onClick={handleSignOut} className='toggle-button signout-btn'>
        Sign Out
      </button>
    </div>
  );
};

export default MainPage;