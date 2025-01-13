from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
import bcrypt
from encrypt_decrypt import createKey, generate_salt
import os

login_bp = Blueprint('login_register', __name__)
bcrypt = Bcrypt()

@login_bp.route('/register', methods=['POST'])
def register_route():
    from server import mongo #Inside function to avoid circular import errors
    data = request.get_json()
    print(f"Session before register: {session}")
    print(data)
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and Password are required'}), 400

    existing_user = mongo.db.users.find_one({'username': username})
    if existing_user:
        return jsonify({'error': 'Username already taken. Please choose another.'}), 400

    salt = generate_salt()
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    key = createKey(password.encode(), salt)
    print(f"session key (registration) {key}")

    mongo.db.users.insert_one({
        'username': username,
        'hashed_master_password': hashed_password,
        'salt': salt.hex()
    })
    session['key'] = key
    session['salt'] = salt
    session.modified = True
    print(f"session after register {session}" )

    return jsonify({'message': 'User registered successfully'}), 201


@login_bp.route('/login', methods=['POST'])
def login_route():
    from server import mongo #Inside function to avoid circular import errors
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if 'key' not in session:
        return jsonify({'error': 'No key found in session'}), 400

    if not username or not password:
        return jsonify({'error': 'Username and Password are required'}), 400

    user = mongo.db.users.find_one({'username': username})
    if not user:
        return jsonify({'error': 'Invalid username or password'}), 401

    if not bcrypt.check_password_hash(user['hashed_master_password'], password):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    salt = bytes.fromhex(user['salt'])
    key = createKey(password.encode(), salt)
    print(f"session key (login) {key}")

    session['key'] = key
    session['salt'] = user['salt']
    print(f"session after login {session}" )
    return jsonify({'message': 'Login successful'}), 200

@login_bp.route('/logout', methods=['POST'])
def logout_route():
    session.clear() 
    return jsonify({'message': 'Logged out successfully'}), 200