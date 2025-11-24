import os
import mysql.connector
from dotenv import load_dotenv
load_dotenv()
DB_CONFIG={
    "host":os.getenv("DB_HOST","localhost"),
    "user":os.getenv("DB_USER","root"),
    "database":os.getenv("DB_NAME",
                         "si_pengelolaan_stok"),
                         "autocommit":True 
}
def get_db():
    return mysql.connector.connect(**DB_CONFIG)