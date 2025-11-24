from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)   # <-- dua underscore
CORS(app)

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="si_pengelolaan_stok"
    )

@app.route("/api/test")
def test():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 'Backend OK!'")
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify({"message": result[0]})

@app.route("/barang", methods=["GET"])
def get_barang():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM barang ORDER BY barang_id DESC")
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(result)

if __name__ == "__main__":   # <-- dua underscore di kiri & kanan
    app.run(debug=True)
