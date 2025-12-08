from flask import Blueprint, jsonify, request
from db import get_db
from datetime import datetime

# Ganti nama blueprint menjadi "transactions_keluar" dan prefix URL menjadi "/transactions-keluar"
bp = Blueprint("transactions_keluar", __name__, url_prefix="/transactions-keluar")

# --- Helper Functions (TIDAK DIUBAH) ---

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
        print("--- DATABASE EXCEPTION START ---")
        print(f"Query Gagal: {query}")
        print(f"Args: {args}")
        print(f"Error Detail: {e}")
        print("--- DATABASE EXCEPTION END ---")
        conn.rollback()
        raise e 
        
    finally:
        cur.close()
        conn.close()
    return data

def success(data=None, message=None):
    res = {"success": True}
    if message: res["message"] = message
    if data is not None: res["data"] = data
    return jsonify(res), 200

def error(message, status_code=400):
    return jsonify({"success": False, "message": message}), status_code



# ======================================================================
# 1. GET ALL (READ)
# ======================================================================
@bp.route("/", methods=["GET"])
def get_all_transactions_keluar():
    query = """
        SELECT
            tk.trans_keluar_id,
            tk.user_id,
            tk.barang_id,
            tk.nama_pembeli,
            tk.jumlah,
            tk.saluran,
            tk.ekspedisi,
            DATE_FORMAT(tk.tanggal_keluar, '%Y-%m-%d') AS tanggal_keluar,
            tk.keterangan,
            b.nama_barang AS nama_barang,
            u.nama AS nama_user
        FROM transactions_keluar tk
        JOIN barang b ON tk.barang_id = b.barang_id
        JOIN users u ON tk.user_id = u.user_id
        ORDER BY tk.tanggal_keluar DESC
    """
    
    try:
        data = query_db(query, fetch=True, many=True)
        return success(data=data)
    except Exception as e:
        print(f"Error fetching transactions_keluar: {e}")
        return error("Gagal mengambil data transactions Keluar. Cek log server.", 500)



# ======================================================================
# 2. CREATE (POST)
# ======================================================================
@bp.route("/", methods=["POST"])
def add_transactions_keluar():
    data = request.json

    barang_id = data.get("barang_id")
    user_id = data.get("user_id")
    jumlah = data.get("jumlah")
    tanggal_keluar_str = data.get("tanggal_keluar")

    # Field khusus transaksi keluar
    nama_pembeli = data.get("nama_pembeli")
    saluran = data.get("saluran")
    ekspedisi = data.get("ekspedisi")
    keterangan = data.get("keterangan")

    if not all([barang_id, user_id, jumlah, tanggal_keluar_str]):
        return error("Data wajib (barang_id, user_id, jumlah, tanggal_keluar) tidak lengkap.", 400)
    
    try:
        tanggal_keluar = datetime.strptime(tanggal_keluar_str, "%Y-%m-%d").date()
        jumlah = int(jumlah)
    except ValueError:
        return error("Format data tidak valid (Tanggal harus YYYY-MM-DD, Jumlah harus angka).", 400)
    

    query = """
        INSERT INTO transactions_keluar
            (user_id, barang_id, nama_pembeli, jumlah, saluran, ekspedisi, tanggal_keluar, keterangan)
        VALUES 
            (%s, %s, %s, %s, %s, %s, %s, %s)
    """

    params = (
        user_id, barang_id, nama_pembeli, jumlah,
        saluran, ekspedisi, tanggal_keluar, keterangan
    )

    try:
        # Insert transaksi keluar
        query_db(query, params)

        # Kurangi stok
        update_stok = "UPDATE barang SET stok_saat_ini = stok_saat_ini - %s WHERE barang_id = %s"
        query_db(update_stok, (jumlah, barang_id))

        return success(message="Transaksi Keluar berhasil ditambahkan dan stok diperbarui")
    except Exception as e:
        return error(f"Insert Error: {str(e)}", 500)



# ======================================================================
# 3. UPDATE (PUT)
# ======================================================================
@bp.route("/<int:id>", methods=["PUT"])
def update_transactions_keluar(id):
    existing = query_db("SELECT jumlah, barang_id FROM transactions_keluar WHERE trans_keluar_id=%s", (id,), fetch=True)
    if not existing:
        return error("Transaksi Keluar tidak ditemukan", 404)

    data = request.json

    jumlah_lama = existing["jumlah"]
    barang_id_lama = existing["barang_id"]

    user_id = data.get("user_id")
    barang_id_baru = data.get("barang_id")
    nama_pembeli = data.get("nama_pembeli")
    jumlah_baru = data.get("jumlah")
    saluran = data.get("saluran")
    ekspedisi = data.get("ekspedisi")
    tanggal_keluar_str = data.get("tanggal_keluar")
    keterangan = data.get("keterangan")

    if not all([user_id, barang_id_baru, jumlah_baru, tanggal_keluar_str]):
        return error("Data wajib tidak lengkap", 400)

    try:
        tanggal_keluar = datetime.strptime(tanggal_keluar_str, "%Y-%m-%d").date()
        jumlah_baru = int(jumlah_baru)
    except ValueError:
        return error("Format data tidak valid.", 400)

    perbedaan = jumlah_baru - jumlah_lama

    query = """
        UPDATE transactions_keluar
        SET user_id=%s, barang_id=%s, nama_pembeli=%s, jumlah=%s,
            saluran=%s, ekspedisi=%s, tanggal_keluar=%s, keterangan=%s
        WHERE trans_keluar_id=%s
    """

    params = (
        user_id, barang_id_baru, nama_pembeli, jumlah_baru,
        saluran, ekspedisi, tanggal_keluar, keterangan, id
    )

    try:
        # Update transaksi
        query_db(query, params)

        # Logic stok
        if barang_id_baru != barang_id_lama:
            # Balikin stok lama
            query_db("UPDATE barang SET stok_saat_ini = stok_saat_ini + %s WHERE barang_id=%s", (jumlah_lama, barang_id_lama))
            # Ambil stok baru
            query_db("UPDATE barang SET stok_saat_ini = stok_saat_ini - %s WHERE barang_id=%s", (jumlah_baru, barang_id_baru))
        else:
            # Kurangi / tambah sesuai selisih
            query_db("UPDATE barang SET stok_saat_ini = stok_saat_ini - %s WHERE barang_id=%s", (perbedaan, barang_id_baru))

        return success(message="Transaksi Keluar berhasil diperbarui")
    except Exception as e:
        return error(f"Update Error: {str(e)}", 500)



# ======================================================================
# 4. DELETE (DELETE)
# ======================================================================
@bp.route("/<int:id>", methods=["DELETE"])
def delete_transactions_keluar(id):
    existing = query_db("SELECT jumlah, barang_id FROM transactions_keluar WHERE trans_keluar_id=%s", (id,), fetch=True)
    if not existing:
        return error("Transaksi Keluar tidak ditemukan", 404)

    jumlah_dihapus = existing["jumlah"]
    barang_id_terkait = existing["barang_id"]

    try:
        query_db("DELETE FROM transactions_keluar WHERE trans_keluar_id=%s", (id,))

        # Hapus transaksi keluar → stok dikembalikan
        query_db("UPDATE barang SET stok_saat_ini = stok_saat_ini + %s WHERE barang_id=%s",
                 (jumlah_dihapus, barang_id_terkait))

        return success(message="Transaksi Keluar berhasil dihapus dan stok dikembalikan")
    except Exception as e:
        return error(f"Delete Error: {str(e)}", 500)



# ======================================================================
# 5. GET ONE (READ)
# ======================================================================
@bp.route("/<int:id>", methods=["GET"])
def get_transactions_keluar_by_id(id):
    query = """
        SELECT
            tk.trans_keluar_id,
            tk.user_id,
            tk.barang_id,
            tk.nama_pembeli,
            tk.jumlah,
            tk.saluran,
            tk.ekspedisi,
            DATE_FORMAT(tk.tanggal_keluar, '%Y-%m-%d') AS tanggal_keluar,
            tk.keterangan,
            b.nama_barang AS nama_barang,
            u.nama AS nama_user
        FROM transactions_keluar tk
        JOIN barang b ON tk.barang_id = b.barang_id
        JOIN users u ON tk.user_id = u.user_id
        WHERE tk.trans_keluar_id = %s
    """

    try:
        data = query_db(query, (id,), fetch=True)
        if data:
            return success(data=data)
        return error("Transaksi Keluar tidak ditemukan", 404)
    except Exception as e:
        return error(f"Get Detail Error: {str(e)}", 500)

    










    








