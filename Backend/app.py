from flask import Flask
from flask_cors import CORS
from db import get_db
from barang import bp as barang_bp
from alerts import bp as alerts_bp

app = Flask(__name__)

CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# REGISTER BLUEPRINT
app.register_blueprint(barang_bp)
app.register_blueprint(alerts_bp)

if __name__ == "__main__":
    app.run(debug=True)
