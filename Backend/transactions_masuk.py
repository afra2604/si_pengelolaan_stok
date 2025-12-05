from flask import Blueprint, jsonify, request
from db import get_db
from datetime import datetime


bp = Blueprint("transactions_masuk", __name__, url_prefix="/transactions-masuk")



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
        # !!! DEBUG: TAMPILKAN ERROR KE TERMINAL UNTUK MENDIAGNOSA 500 !!!
        print("--- DATABASE EXCEPTION START ---")
        print(f"Query Gagal: {query}")
        print(f"Args: {args}")
        print(f"Error Detail: {e}")
        print("--- DATABASE EXCEPTION END ---")
        conn.rollback()
        # Mengangkat exception agar Flask mengembalikan 500
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
# 1. GET ALL (READ) - Ambil Semua Data transactions Masuk (PERBAIKAN UTAMA)
# ======================================================================
@bp.route("/", methods=["GET"])
def get_all_transactions_masuk():
    # PERBAIKAN: Menggunakan JOIN ke tabel 'barang' (b) dan 'users' (u)
    # serta menggunakan DATE_FORMAT untuk memastikan output tanggal valid.
    query = """
        SELECT
            tm.trans_masuk_id,
            tm.user_id,
            tm.barang_id,
            tm.nama_supplier,
            tm.jumlah,
            -- Format tanggal sebagai string YYYY-MM-DD untuk kompatibilitas JSON/JS
            DATE_FORMAT(tm.tanggal_masuk, '%Y-%m-%d') AS tanggal_masuk,
            tm.keterangan,
            b.nama_barang AS nama_barang,  -- Ambil nama barang
            u.nama AS nama_user           -- Ambil nama user/pencatat (Asumsi nama kolom di tabel users adalah 'nama')
        FROM transactions_masuk tm
        JOIN barang b ON tm.barang_id = b.barang_id
        JOIN users u ON tm.user_id = u.user_id
        ORDER BY tm.tanggal_masuk DESC
    """
    
    try:
        data = query_db(query, fetch=True, many=True)
        return success(data=data)
    except Exception as e:
        # Menangkap error dan mengembalikannya sebagai response 500
        print(f"Error fetching transactions_masuk: {e}")
        return error("Gagal mengambil data transactions Masuk dari database. Cek detail error di log server.", 500)


# ======================================================================
# 2. CREATE (POST) - Tambah Data transactions Masuk (PENAMBAHAN LOGIKA STOK)
# ======================================================================
@bp.route("/", methods=["POST"])
def add_transactions_masuk():
    data = request.json
    # Wajib ada
    barang_id = data.get("barang_id")
    user_id = data.get("user_id")
    jumlah = data.get("jumlah")
    tanggal_masuk_str = data.get("tanggal_masuk") 
    
    # Opsional
    nama_supplier = data.get("nama_supplier")
    keterangan = data.get("keterangan")
    
    if not all([barang_id, user_id, jumlah, tanggal_masuk_str]):
        return error("Data wajib (barang_id, user_id, jumlah, tanggal_masuk) tidak lengkap.", 400)
    
    try:
        # Konversi tanggal_masuk string menjadi objek date MySQL (YYYY-MM-DD)
        tanggal_masuk = datetime.strptime(tanggal_masuk_str, "%Y-%m-%d").date()
        jumlah = int(jumlah) # Pastikan jumlah adalah integer
    except ValueError:
        return error("Format data tidak valid (Tanggal harus YYYY-MM-DD, Jumlah harus angka).", 400)

    # Query untuk memasukkan data baru
    query = """
        INSERT INTO transactions_masuk 
            (user_id, barang_id, nama_supplier, jumlah, tanggal_masuk, keterangan) 
        VALUES 
            (%s, %s, %s, %s, %s, %s)
    """
    params = (user_id, barang_id, nama_supplier, jumlah, tanggal_masuk, keterangan)
    
    try:
        # 1. Eksekusi query INSERT
        query_db(query, params)
        
        # 2. Update Stok Barang: Tambahkan jumlah ke stok_saat_ini di tabel 'barang'
        update_stok_query = "UPDATE barang SET stok_saat_ini = stok_saat_ini + %s WHERE barang_id = %s"
        query_db(update_stok_query, (jumlah, barang_id))
        
        return success(message="Transaksi Masuk berhasil ditambahkan dan stok barang diperbarui")
    except Exception as e:
        return error(f"Insert Error: Gagal menyimpan data transaksi. Detail: {str(e)}", 500)

# ======================================================================
# 3. UPDATE (PUT) - Edit Data transactions Masuk (PENAMBAHAN LOGIKA STOK)
# ======================================================================
@bp.route("/<int:id>", methods=["PUT"])
def update_transactions_masuk(id):
    # Cek keberadaan data dan ambil data penting untuk perhitungan stok
    existing = query_db("SELECT jumlah, barang_id FROM transactions_masuk WHERE trans_masuk_id=%s", (id,), fetch=True)
    if not existing:
        return error("Transaksi Masuk tidak ditemukan", 404)

    data = request.json
    
    jumlah_lama = existing["jumlah"]
    barang_id_lama = existing["barang_id"]
    
    # Ambil data baru
    user_id = data.get("user_id")
    barang_id_baru = data.get("barang_id")
    nama_supplier = data.get("nama_supplier")
    jumlah_baru = data.get("jumlah")
    tanggal_masuk_str = data.get("tanggal_masuk")
    keterangan = data.get("keterangan")
    
    if not all([user_id, barang_id_baru, jumlah_baru, tanggal_masuk_str]):
        return error("Data wajib tidak lengkap", 400)

    try:
        tanggal_masuk = datetime.strptime(tanggal_masuk_str, "%Y-%m-%d").date()
        jumlah_baru = int(jumlah_baru)
    except ValueError:
        return error("Format data tidak valid (Tanggal harus YYYY-MM-DD, Jumlah harus angka).", 400)
    
    # Tentukan perbedaan jumlah untuk update stok yang benar
    perbedaan_jumlah = jumlah_baru - jumlah_lama
    
    query = """
        UPDATE transactions_masuk
        SET 
            user_id=%s, barang_id=%s, nama_supplier=%s, jumlah=%s, 
            tanggal_masuk=%s, keterangan=%s
        WHERE trans_masuk_id=%s
    """
    params = (
        user_id, barang_id_baru, nama_supplier, jumlah_baru, 
        tanggal_masuk, keterangan, id
    )

    try:
        # 1. Update data transaksi
        query_db(query, params)
        
        # 2. Update Stok Barang
        # Kasus A: Barang ID berubah
        if barang_id_baru != barang_id_lama:
            # a. Kurangi stok barang lama (sesuai jumlah lama)
            query_db("UPDATE barang SET stok_saat_ini = stok_saat_ini - %s WHERE barang_id = %s", (jumlah_lama, barang_id_lama))
            # b. Tambahkan stok barang baru (sesuai jumlah baru)
            query_db("UPDATE barang SET stok_saat_ini = stok_saat_ini + %s WHERE barang_id = %s", (jumlah_baru, barang_id_baru))
        # Kasus B: Hanya jumlah yang berubah pada Barang ID yang sama
        elif perbedaan_jumlah != 0:
            # Tambahkan atau kurangi selisih jumlah
            query_db("UPDATE barang SET stok_saat_ini = stok_saat_ini + %s WHERE barang_id = %s", (perbedaan_jumlah, barang_id_baru))

        return success(message="Transaksi Masuk berhasil diperbarui")
    except Exception as e:
        return error(f"Update Error: Gagal memperbarui data transaksi. Detail: {str(e)}", 500)

# ======================================================================
# 4. DELETE (DELETE) - Hapus Data transactions Masuk (PENAMBAHAN LOGIKA STOK)
# ======================================================================
@bp.route("/<int:id>", methods=["DELETE"])
def delete_transactions_masuk(id):
    # Cek keberadaan data dan ambil data penting untuk update stok
    existing = query_db("SELECT jumlah, barang_id FROM transactions_masuk WHERE trans_masuk_id=%s", (id,), fetch=True)
    if not existing:
        return error("Transaksi Masuk tidak ditemukan", 404)
        
    jumlah_dihapus = existing["jumlah"]
    barang_id_terkait = existing["barang_id"]

    try:
        # 1. Hapus data transaksi
        query_db("DELETE FROM transactions_masuk WHERE trans_masuk_id=%s", (id,))
        
        # 2. Update Stok Barang: Kurangi stok karena transaksi masuk dibatalkan/dihapus
        update_stok_query = "UPDATE barang SET stok_saat_ini = stok_saat_ini - %s WHERE barang_id = %s"
        query_db(update_stok_query, (jumlah_dihapus, barang_id_terkait))

        return success(message="Transaksi Masuk berhasil dihapus dan stok barang dikurangi")
    except Exception as e:
        # Ini mungkin terjadi jika ada foreign key constraint
        return error(f"Delete Error: Gagal menghapus transaksi. Detail: {str(e)}", 500)

# ======================================================================
# 5. GET ONE (READ) - Ambil Satu Data transactions Masuk
# ======================================================================
@bp.route("/<int:id>", methods=["GET"])
def get_transactions_masuk_by_id(id):
    query = """
        SELECT
            tm.trans_masuk_id,
            tm.user_id,
            tm.barang_id,
            tm.nama_supplier,
            tm.jumlah,
            DATE_FORMAT(tm.tanggal_masuk, '%Y-%m-%d') AS tanggal_masuk,
            tm.keterangan,
            b.nama_barang AS nama_barang, 
            u.nama AS nama_user          
        FROM transactions_masuk tm
        JOIN barang b ON tm.barang_id = b.barang_id
        JOIN users u ON tm.user_id = u.user_id
        WHERE tm.trans_masuk_id = %s
    """
    
    try:
        data = query_db(query, (id,), fetch=True)
        if data:
            return success(data=data)
        return error("Transaksi Masuk tidak ditemukan", 404)
    except Exception as e:
        return error(f"Get Detail Error: {str(e)}", 500)