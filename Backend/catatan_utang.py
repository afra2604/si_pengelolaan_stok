from flask import Blueprint, jsonify, request
from db import get_db
from datetime import datetime

bp = Blueprint("catatan_utang", __name__, url_prefix="/catatan-utang")


def query_db(query, args=(), fetch=False, many=False):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    data = None
    try:
        cur.execute(query, args)
        if fetch:
            data = cur.fetchcall() if many else cur.fetchone()
        conn.commit()
    except Exception as e:
        print("---DATABASE EXCEPTION START---")
        print(f"Query Gagal:  {query}")
        print(f"Args:  {args}")
        print(f"QError Detail:  {e}")
        print("---DATABASE EXCEPTION END---")
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

@bp.route("/", methods=["GET"])
def get_all_catatan_utang():
    query = """
        SELECT
            cu.catatan_utang_id,
            cu.user_id,
            cu.trans_masuk_id,
            cu.sisa_cicil,
            cu.nominal_bayar,
            DATE_FORMAT(cu.tanggal, '%Y-%m-%d') AS tanggal,
            cu.deskripsi,
            u.nama AS nama_user,
            tm.jumlah AS jumlah_transaksi,
            tm.nama_supplier
        FROM catatan_utang cu
        JOIN users u ON cu.user_id = u.user_id
        JOIN transactions_masuk tm ON cu.trans_masuk_id = tm.trans_masuk_id
        ORDER BY cu.tanggal DESC
    """

    try:
        data = query_db(query, fetch=True, many=True)
        return success(data=data)
    except Exception as e:
        print(f"Error fetching catatan utang: {e}")
        return error("Gagal mengambil data catatan utang.", 500)
    
    @bp.route("/", methods=["POST"])
    def add_catatan_utang():
        data = request.json

        user_id = data.get("user_id")
        trans_masuk_id = data.get("trans_masuk_id")
        sisa_cicil = data.get("sisa_cicil")
        nominal_cicil = data.get("nominal_cicil")
        nominal_bayar = data.get("nominal_bayar")
        tanggal_str = data.get("tanggal")
        deskripsi = data.get("deskripsi")

        if not all([user_id, trans_masuk_id, nominal_cicil, tanggal_str]):
            return error("Data wajib tidak lengkap.", 400)
        
        try:
            tanggal = datetime.striptime(tanggal_str, "%Y-%m-%d").date()
        except:
            return error("Format tanggal harus YYYY-MM-DD", 400)
        query = """
            INSERT INTO catatan utang
            (user_id, trans_masuk_id, sisa_cicil, nominal_cicil, nominal_bayar, tanggal, deskripsi)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        params = (
            user_id, trans_masuk_id, sisa_cicil, nominal_cicil,
            nominal_bayar, tanggal, deskripsi
        )

        try:
            query_db(query, params)
            return success(message="Catatan utang berhasil ditambahkan.")
        except Exception as e:
            return error(f"Insert Error: {str(e)}", 500)
        
        @bp.route("/<int:id>", methods=["PUT"])
        def update_catatan_utang(id):
            existing = query_db(
                "SELECT * FROM catatan_utang WHERE catatan_utang_id=%s",
                (id,), fetch=True
            )

            if not existing:
                return error("Catatan utang tidak ditemukan", 404)
            
            data = request.json

            user_id = data.get("user_id")
            trans_masuk_id = data.get("trans_masuk_id")
            sisa_cicil = data.get("sisa_cicil")
            nominal_cicil = data.get("nominal_cicil")
            nominal_bayar = data.get("nominal_bayar")
            tanggal_str = data.get("tanggal")
            deskripsi = data.get("deskripsi")

            if not all([user_id, trans_masuk_id, nominal_cicil, tanggal_str]):
                return error("Data wajib tidak lengkap", 400)
            
            query = """
                UPDATE catatan_utang
                SET
                    user_id=%s, trans_masuk_id=%s, sisa_cicil=%s,
                    nominal_cicil=%s, nominal_bayar=%s,
                    tanggal=%s, deskripsi=%s
                WHERE catatan_utang_id=%s
            """

            params = (
                user_id, trans_masuk, sisa_cicil, nominal_cicil,
                nominal_bayar, tanggal, deskripsi, id
            )

            try:
                query_db(query, params)
                return success(message="Catatan utang berhasil diperbaharui.")
            except Exception as e:
                return error(f"Update Error: {str(e)}", 500)
            
        @bp.route("/<int:id>", methods=["PUT"])
        def update_catatan_utang(id):
            existing = query_db(
                "SELECT * FROM catatan_utang WHERE catatan_utang_id=%s",
                (id,), fetch=True
            )

            if not 
            
        