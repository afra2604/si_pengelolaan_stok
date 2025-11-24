from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
# from alerts import bp as alerts_bp

app = Flask(__name__)
CORS(app)

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="si_pengelolaan_stok"
    )

# ==========================
# LOGIN
# ==========================
@app.post("/login")
def login():
    data = request.json
    nama = data.get("nama")
    password = data.get("password")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM users WHERE nama=%s AND password=%s",
        (nama, password)
    )
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user:
        return jsonify({"success": True, "user": user})

    return jsonify({"success": False, "message": "Invalid credentials"}), 401

# ==========================
# GET USERS
# ==========================
@app.route("/api/users")
def get_users():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users")
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(result)


# ==========================
# GET BARANG (untuk Dashboard)
# ==========================
@app.route("/barang", methods=["GET"])
def get_barang():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM barang ORDER BY barang_id DESC")
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(result)

# # REGISTER BLUEPRINT
# app.register_blueprint(alerts_bp)
# ==========================
# RUN APP
# ==========================
if __name__ == "__main__":
    app.run(debug=True)
