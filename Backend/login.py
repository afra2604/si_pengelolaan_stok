from flask import Blueprint, request, jsonify
from db import get_db 

bp_auth = Blueprint("auth", __name__ , url_prefix="/") 



def success_auth(user_data=None, message="Success"):
    res = {"success": True, "message": message}
    if user_data is not None:
        
        if "password" in user_data:
            del user_data["password"]
        res["data"] = user_data 
    return jsonify(res), 200

def error_auth(message, code=401):
    return jsonify({"success": False, "error": message}), code



# LOGIN ROUTE (MODIFIED FOR PLAIN TEXT PASSWORD)

@bp_auth.post("/login")
def login():
    data = request.json
    nama = data.get("nama")
    password = data.get("password") # Password yang dimasukkan oleh user

    if not nama or not password:
        return error_auth("Nama atau password wajib diisi", 400)

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM users WHERE nama = %s", (nama,))
        user = cursor.fetchone()
    except Exception as e:
        return error_auth(f"Database error: {e}", 500)
    finally:
        cursor.close()
        conn.close() 


    # Membandingkan password teks biasa dari input user dengan password teks biasa di database
    if user and user["password"] == password:
        return success_auth(user_data=user, message="Login berhasil")
    # ---------------------------------

    return error_auth("Nama atau password salah")