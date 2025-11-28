# auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from db import get_db

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    nama = data.get("nama")
    password = data.get("password")
    peran = data.get("peran", "kepala_gudang")

    if not nama or not password:
        return jsonify({"msg": "nama dan password wajib"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT user_id FROM users WHERE nama=%s", (nama,))
    if cur.fetchone():
        cur.close()
        return jsonify({"msg": "nama sudah digunakan"}), 400

    pwd_hash = generate_password_hash(password)
    cur.execute("INSERT INTO users (nama, password, peran) VALUES (%s,%s,%s)", (nama, pwd_hash, peran))
    cur.close()
    return jsonify({"msg": "registered"}), 201

@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    nama = data.get("nama")
    password = data.get("password")

    if not nama or not password:
        return jsonify({"msg": "nama dan password wajib"}), 400

    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT user_id, nama, password, peran FROM users WHERE nama=%s", (nama,))
    user = cur.fetchone()
    cur.close()

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"msg": "invalid login"}), 401

    token = create_access_token(identity={
        "user_id": user["user_id"],
        "nama": user["nama"],
        "peran": user["peran"]
    })
    return jsonify({"access_token": token})
