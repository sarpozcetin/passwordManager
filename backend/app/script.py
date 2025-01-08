from flask import Flask, request, jsonify
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import os
import base64

app = Flask(__name__)

#Salt generation for creating the key
def generate_salt() -> bytes:
    return os.urandom(16)

def createKey(pw: str, salt: bytes) -> bytes:

    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(),
                     length=32,
                     salt=salt,
                     iterations=100000,
                     backend=default_backend)
    
    return base64.urlsafe_b64encode(kdf.derive(pw.encode()))

@app.route('/encrypt', methods=['POST'])
def encrypt(pw: str, salt: bytes) -> bytes:
    data = request.get_json()
    password = data.get('password')
    salt = generate_salt()
    encrypted, salt = encrypt(password, salt)
    return jsonify({'encrypted_password': encrypted.decode(), 'salt': salt.hex()})

@app.route('/decrypt', methods=['POST'])
def decrypt(encrypted: bytes, salt: bytes, pw: str) -> str:
    data = request.get_json()
    encrypted = base64.urlsafe_b64decode(data.get('encrypted_password'))
    salt = bytes.fromhex(data.get('salt'))
    password = data.get('password')
    decrypted = decrypt(encrypted, salt, password)
    return jsonify({'decrypted_password': decrypted})

if __name__ == '__main__':
    app.run(debug=True)