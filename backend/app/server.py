# server.py
'''
Main Flask application that initializes the app, extensions, CORS, MongoDB, and registers the blueprints
'''

from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY')

# CORS Initialization for frontend to backend communication
CORS(app, supports_credentials=True, origins=['http://localhost:3000'])

#MongoDB initialization
app.config['MONGO_URI'] = os.getenv('MONGO_URI')  # ← ADD THIS LINE
mongo = PyMongo(app)

#password hashing
bcrypt = Bcrypt(app)

#Register the required blueprints
from auth import auth_bp
from vault import vault_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(vault_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)