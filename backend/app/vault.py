#vault.py
"""
Vault used for password storage. All the encryption/decryption happens in the browser.
Server only stores encrypted blobs and the IV (Initialization Vector
"""

from flask import Blueprint, request, jsonify, session
from bson import ObjectId

vault_bp = Blueprint("vault", __name__)

#Saves the encrypted password
@vault_bp.route("/vault", methods=["POST"])
def save_entry():
    from server import mongo

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    account = data.get('account')
    username = data.get('username', "")
    encrypted_password = data.get('encrypted_password')
    iv = data.get('iv')

    result = mongo.db.passwords.insert_one({
        "user_id": session["user_id"],
        "account": account,
        "username": username,
        "encrypted_password": encrypted_password, #Already encrypted in the browser
        "iv": iv #Random IV (Initialization Vector) for encryption
    })

    saved_entry = mongo.db.passwords.find_one({"_id": result.inserted_id})

    return jsonify({
        "_id": str(saved_entry["_id"]),
        "account": saved_entry["account"],
        "username": saved_entry["username"]
    }), 201

#Gets all the encrypted passwords for the user
@vault_bp.route("/vault", methods=["GET"])
def get_vault():
    from server import mongo

    if "user_id" not in session:
        return jsonify([]), 200

    entries = mongo.db.passwords.find({"user_id": session["user_id"]})
    return jsonify([{
        "_id": str(e["_id"]),
        "account": e["account"],
        "username": e["username"],
        "encrypted_password": e["encrypted_password"],
        "iv": e["iv"]
    } for e in entries])

#Deletes an entry for the user
@vault_bp.route("/vault/<entry_id>", methods=["DELETE"])
def delete_entry(entry_id):
    from server import mongo

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    result = mongo.db.passwords.delete_one({
        "_id": ObjectId(entry_id),
        "user_id": session["user_id"] #Ensure the user only deletes their entries
    })
    if result.deleted_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"message": "Deleted"}), 200