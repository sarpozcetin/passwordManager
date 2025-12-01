#auth.py
'''
Authentication blueprint that handles register, login, logout, and retrieving the user's salt for encryption
'''

from flask import Blueprint, request, jsonify, session
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)


#Register a new user in the system
@auth_bp.route('/register', methods=['POST'])
def register():
    from backend import mongo, bcrypt
    import os

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    #Validate user 
    if not username or not password:
        return jsonify({'error': 'Username and Password are required'}), 400
    
    #Ensure theres no duplicate users
    if mongo.db.users.find_one({'username': username}):
        return jsonify({'error': 'Username already taken. Please choose another.'}), 400
    
    #Hash the password and create salts for key derivation (32-char hex string)
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    salt = os.urandom(16)

    #Save the user in the database
    mongo.db.users.insert_one({
        'username': username,
        'hashed_master_password': hashed_password,
        'salt': salt.hex()
    })

    return jsonify({'message': 'User registered successfully'}), 201


#Login existing users
@auth_bp.route('/login', methods=['POST'])
def login():
    from backend import mongo, bcrypt
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = mongo.db.users.find_one({'username': username})

    if not user or not bcrypt.check_password_hash(user['hashed_master_password'], password):
        return jsonify({'error': 'Invalid Credentials, check username or password'}), 401

    #Creates a session to prove user is logged in
    session['user_id'] = user['_id']
    session['username'] = username

    return jsonify({'message': 'Login successful', 'salt': user['salt']}), 200

#Logout current user
@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear() 
    return jsonify({'message': 'Logged out successfully'}), 200

#Gets the current user's salt after logging in
@auth_bp.route('/salt', methods=['GET'])
def salt():
    from backend import mongo

    if 'user_id' not in session:
        return jsonify({'error: Unauthorized'}), 401
    
    try:
        user = mongo.db.users.find_one({'_id': session['user_id']})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'salt': user['salt']})
    except Exception as e:
        print('Error in salt:', str(e))
        return jsonify({'error': 'Server error'}), 500
