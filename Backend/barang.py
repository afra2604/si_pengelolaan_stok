from flask import Blueprint, jsonify, request
from db import get_db
from datetime import datetime

bp = Blueprint("barang", __name__, url_prefix="/barang")


def query_db(query, args=(), fetch=False, many=False):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    data = None
    try:
        cur.execute(query, args)
        
        if fetch:
            data = cur.fetchall() if many else cur.fetchone()
            
        conn.commit()
        
    except Exception as e:
        # !!! DEBUG: TAMPILKAN ERROR KE TERMINAL !!!
        print("--- DATABASE EXCEPTION START ---")
        print(f"Query Gagal: {query}")
        print(f"Args: {args}")
        print(f"Error Detail: {e}")
        print("--- DATABASE EXCEPTION END ---")
        conn.rollback()
        raise e # Meneruskan error ke route untuk ditangkap dan dikirim sebagai 500
        
    finally:
        cur.close()
        conn.close() 
    return data


# Response Helpers

def success(data=None, message=None):
    res = {"success": True}
    if message: res["message"] = message
    if data is not None: res["data"] = data
    return jsonify(res), 200

def error(message, code=400):
    return jsonify({"success": False, "error": message}), code


# 1. READ (GET) - Ambil Semua Data

@bp.route("/", methods=["GET"])
def get_all_barang():
    try:
        data = query_db("SELECT * FROM barang ORDER BY barang_id DESC", many=True, fetch=True)

        # Format tanggal agar tidak error saat di-convert ke JSON
        if data:
            for item in data:
                if item.get('tanggal_barang') and isinstance(item['tanggal_barang'], (datetime, datetime.date)):
                    item['tanggal_barang'] = item['tanggal_barang'].strftime('%Y-%m-%d')
                
        return success(data=data)
    except Exception as e:
        return error(f"Load Data Error: {str(e)}", 500)



# 2. CREATE (POST) - Tambah Data Baru

@bp.route("/", methods=["POST"])
def create_barang():
    data = request.json
    
    if not data.get("nama_barang"):
        return error("Nama barang wajib diisi", 400)

    # Ambil data dari request
    nama_barang = data.get("nama_barang")
    kategori = data.get("kategori", "")
    jenis_barang = data.get("jenis_barang", "")
    watt = data.get("watt", 0) 
    harga_beli = data.get("harga_beli", 0)
    stok_minimum = data.get("stok_minimum", 0)
    stok_saat_ini = data.get("stok_saat_ini", 0)
    terjual_online = data.get("terjual_online", 0)
    terjual_offline = data.get("terjual_offline", 0)
    keterangan = data.get("keterangan", "")
    tanggal_barang_str = data.get("tanggal_barang") 

    # Parsing Tanggal
    tanggal_barang = None
    if tanggal_barang_str:
        try:
            tanggal_barang = datetime.strptime(tanggal_barang_str, '%Y-%m-%d')
        except Exception:
            return error("Format tanggal salah (gunakan YYYY-MM-DD)", 400)

    # Query Insert Lengkap
    query = """
        INSERT INTO barang (
            nama_barang, kategori, jenis_barang, watt, harga_beli, 
            stok_minimum, stok_saat_ini, terjual_online, terjual_offline, 
            keterangan, tanggal_barang
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        nama_barang, kategori, jenis_barang, watt, harga_beli, 
        stok_minimum, stok_saat_ini, terjual_online, terjual_offline, 
        keterangan, tanggal_barang
    )

    try:
        query_db(query, params)
        return success(message="Barang berhasil ditambahkan")
    except Exception as e:
        # Jika ini adalah Foreign Key Constraint, error akan muncul di sini
        return error(f"Database Error: {str(e)}", 500)


# 3. UPDATE (PUT) - Edit Data

@bp.route("/<int:id>", methods=["PUT"])
def update_barang(id):
    data = request.json
    
    # Cek apakah barang ada
    existing = query_db("SELECT barang_id FROM barang WHERE barang_id=%s", (id,), fetch=True)
    if not existing:
        return error("Barang tidak ditemukan", 404)

    # Ambil data form
    nama_barang = data.get("nama_barang")
    kategori = data.get("kategori", "") 
    jenis_barang = data.get("jenis_barang", "")
    watt = data.get("watt", 0)
    harga_beli = data.get("harga_beli", 0)
    stok_minimum = data.get("stok_minimum", 0)
    stok_saat_ini = data.get("stok_saat_ini", 0)
    terjual_online = data.get("terjual_online", 0)
    terjual_offline = data.get("terjual_offline", 0)
    keterangan = data.get("keterangan", "")
    tanggal_barang_str = data.get("tanggal_barang")

    # Parsing Tanggal
    tanggal_barang = None
    if tanggal_barang_str:
        try:
            tanggal_barang = datetime.strptime(tanggal_barang_str, '%Y-%m-%d')
        except Exception:
            pass 

    # Query Update Lengkap
    query = """
        UPDATE barang SET 
            nama_barang=%s, kategori=%s, jenis_barang=%s, watt=%s, 
            harga_beli=%s, stok_minimum=%s, stok_saat_ini=%s, 
            terjual_online=%s, terjual_offline=%s, keterangan=%s, 
            tanggal_barang=%s
        WHERE barang_id=%s
    """
    params = (
        nama_barang, kategori, jenis_barang, watt, harga_beli, 
        stok_minimum, stok_saat_ini, terjual_online, terjual_offline, 
        keterangan, tanggal_barang, id
    )

    try:
        query_db(query, params)
        return success(message="Barang berhasil diperbarui")
    except Exception as e:
        return error(f"Update Error: {str(e)}", 500)

# ======================================================================
# 4. DELETE (DELETE) - Hapus Data
# ======================================================================
@bp.route("/<int:id>", methods=["DELETE"])
def delete_barang(id):
    # Cek keberadaan data
    existing = query_db("SELECT barang_id FROM barang WHERE barang_id=%s", (id,), fetch=True)
    if not existing:
        return error("Barang tidak ditemukan", 404)

    try:
        query_db("DELETE FROM barang WHERE barang_id=%s", (id,))
        return success(message="Barang berhasil dihapus")
    except Exception as e:
        # PENTING: Jika Foreign Key Constraint muncul, ini akan mengirimkan pesan error ke React
        return error(f"Delete Error: {str(e)}", 500)