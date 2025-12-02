
## Password Manager
end-to-end encrypted password vault built with Flask, React, and Web Crypto API. 

**This is a portfolio project to demonstrate coding skills. Do not use for real passwords or sensitive data.**

### Features
- Zero-knowledge encryption in-browser with Web Crypto API (AES-256-GCM, PBKDF2)
- Master password verification with decryption test and instant rejection if the wrong password is entered
- An exponential login/unlock backoff with 5 fails maximum (1 minute, 5 minutes, 15 minutes, 1 hours, 24 hours)
- Deletion of passwords is protected with re-entry of master password and confirmation
- Auto-locks the password vault after 20 minutes of inactivity with a full key wipe
- Only displays one password at a time for security purposes
- Ability to copy your password to the clipboard with confirmation
- Modern responsive UI with login, registration, deletion of passwords, and adding new accounts
- Session-based auth (Flask) with secure cookies and a proper logout

### Security Features

- The server never sees the plaintext passwords
- Per-user random salt stored only in the database (hex)
- The master password is never transmitted or stored
- Brute-force resistant with exponential backoff feature
- Deletion of passwords require the master password re-entry for confirmation
- All Cryptography runs client-side so if the server is comprised your passwords are safe


### Tech Stack
 
 ---FRONTEND---
 - React 19 
 - Axios and React Router
 - Web Crypto API
 - CSS animations

---BACKEND---
- Python + Flask
- Flask-PyMongo
- Flask-Bcrypt
- Flask Sessions
- Flask-CORS
- MongoDB

---Cryptography---
- PBKDF2-SHA256
- AES-256-GCM
- 12-byte random IV (Initialization Vector)
- 200,000 PBKDF2 iterations

### Why I built this project
With a strong passion for cybersecurity, I wanted to further understand about real zero-knowledge architecture. This project also gave me a chance to grow my skills and understanding on React, CSS, backend databases, and Flask.