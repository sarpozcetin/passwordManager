from flask import Flask
from flask_pymongo import PyMongo
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)

app.secret_key = os.getenv('FLASK_SECRET_KEY')


CORS(app, supports_credentials=True)

from encrypt_decrypt import crypt_bp
from login import login_bp


mongo_uri = os.getenv('MONGO_URI')
app.config['MONGO_URI'] = mongo_uri
mongo = PyMongo(app)

if not mongo.cx:
    print("Failed to connect to MongoDV. Please check your connection")
else:
    print("MongoDB connected successfully")


app.register_blueprint(crypt_bp, url_prefix='/api')
app.register_blueprint(login_bp, url_prefix='/auth')

if __name__ == '__main__':
    app.run(debug=True)
