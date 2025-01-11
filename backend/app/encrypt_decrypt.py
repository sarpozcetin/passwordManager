from flask import Blueprint, request, jsonify, session
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import os
import base64

crypt_bp = Blueprint('encrypt_decrypt', __name__)

#Salt generation for creating the key
def generate_salt() -> bytes:
    return os.urandom(16)

def createKey(pw: str, salt: bytes) -> bytes:

    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(),
                     length=32,
                     salt=salt,
                     iterations=100000,
                     backend=default_backend)
    
    derived_key = base64.urlsafe_b64encode(kdf.derive(pw.encode()))
    print(f"derived key {derived_key}")
    return derived_key

def encrypt(password: str, key: bytes) -> bytes:
    fernet = Fernet(key)
    encrypted = fernet.encrypt(password.encode())
    return encrypted

def decrypt(encrypted: bytes, key: bytes) -> str:
    fernet = Fernet(key)
    return fernet.decrypt(encrypted).decode('utf-8')

# Flask route for encryption
@crypt_bp.route('/encrypt', methods=['POST'])
def encrypt_route():
    from server import mongo
    data = request.get_json()
    print(f"session at encrypt {session}" )

    print(data)
    print("Session key:", session.get('key'))
    username = data.get('username')
    password = data.get('password')
    account = data.get('account')

    if not username or not password or not account:
        return jsonify({'error': 'Username, Password, and Account are required'}), 400
    
    salt = generate_salt()
    key = createKey(session.get('key'), salt)
    encrypted = encrypt(password, key)

    mongo.db.accounts.insert_one({
        'account_name': account,
        'username': username,
        'encrypted_password': encrypted.decode(),
        'salt': salt.hex()
    })

    return jsonify({
        'encrypted_password': encrypted.decode(),
        'salt': salt.hex()
    })

# Flask route for decryption
@crypt_bp.route('/decrypt', methods=['POST'])
def decrypt_route():
    from server import mongo
    data = request.get_json()
    print(data)
    account = data.get('account')
    if not account:
        return jsonify({'error': 'Account name is required'}), 400

    # Retrieve the stored data from MongoDB
    account = mongo.db.accounts.find_one({'account_name': account})
    if not account:
        return jsonify({'error': 'User not found'}), 404

    encrypted_password = base64.urlsafe_b64decode(account['encrypted_password'])
    salt = bytes.fromhex(account['salt'])
    key = createKey(session.get('key'), salt)
    
    try:
        decrypted = decrypt(encrypted_password, key)
        return jsonify({'decrypted_password': decrypted})
    except Exception as e:
        return jsonify({'error': 'Decryption failed', 'details': str(e)}), 400
