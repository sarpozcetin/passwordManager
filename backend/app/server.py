from flask import Flask
from flask_pymongo import PyMongo
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)

app.secret_key = os.getenv('FLASK_SECRET_KEY')


CORS(app, supports_credentials=True, origins=['http://localhost:3000'], allow_headers="*")

from encrypt_decrypt import crypt_bp
from login import login_bp


mongo_uri = os.getenv('MONGO_URI')
app.config['MONGO_URI'] = mongo_uri
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
mongo = PyMongo(app)

if not mongo.cx:
    print("Failed to connect to MongoDV. Please check your connection")
else:
    print("MongoDB connected successfully")


app.register_blueprint(crypt_bp, url_prefix='/api')
app.register_blueprint(login_bp, url_prefix='/auth')

if __name__ == '__main__':
    app.run(debug=True)
