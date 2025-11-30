from flask import Flask
from flask_cors import CORS
from db import get_db
from barang import bp as barang_bp
from alerts import bp as alerts_bp 
from login import bp_auth

app = Flask(__name__)
# Menggunakan konfigurasi CORS yang lebih spesifik (sudah benar, biarkan saja)
CORS(
    app, 
    origins=["http://localhost:5173"], 
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"], 
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)


# REGISTER BLUEPRINT
app.register_blueprint(barang_bp)
app.register_blueprint(alerts_bp)
app.register_blueprint(bp_auth) 

if __name__ == "__main__":
    # Tetapkan host dan port untuk konsistensi
    app.run(debug=True, host='127.0.0.1', port=5000)