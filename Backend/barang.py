from flask import Blueprint, jsonify, request
from db import get_db

bp = Blueprint("barang", __name__, url_prefix="/barang")



def query_db(query, args=(), fetch=False, many=False):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute(query, args)

        data = None
        if fetch:
            data = cur.fetchall() if many else cur.fetchone()

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

    return data


def success(data=None, message=None):
    res = {"success": True}

    if message:
        res["message"] = message
    if data is not None:
        res["data"] = data

    return jsonify(res), 200


def error(message, code=400):
    return jsonify({"success": False, "error": message}), code



@bp.route("/", methods=["GET"])
def get_all_barang():
    data = query_db("SELECT * FROM barang ORDER BY barang_id DESC", fetch=True, many=True)
    return success(data=data)



@bp.route("/<int:id>", methods=["GET"])
def get_barang(id):
    data = query_db("SELECT * FROM barang WHERE barang_id=%s", (id,), fetch=True)
    if not data:
        return error("Barang tidak ditemukan", 404)
    return success(data=data)


@bp.route("/", methods=["POST"])
def create_barang():
    data = request.json or {}

    nama_barang = data.get("nama_barang")
    if not nama_barang:
        return error("Nama barang wajib diisi")

    query_db("""
        INSERT INTO barang (
            nama_barang, kategori, jenis_barang, watt, harga_beli, 
            stok_minimum, stok_saat_ini, terjual_online, terjual_offline, keterangan
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        data.get("nama_barang"),
        data.get("kategori", ""),
        data.get("jenis_barang", ""),
        data.get("watt", 0),
        data.get("harga_beli", 0),
        data.get("stok_minimum", 0),
        data.get("stok_saat_ini", 0),
        data.get("terjual_online", 0),
        data.get("terjual_offline", 0),
        data.get("keterangan", "")
    ))

    return success(message="Barang berhasil ditambahkan")


# ======================================================================
# UPDATE FULL (PUT)
# ======================================================================
@bp.route("/<int:id>", methods=["PUT"])
def update_barang(id):
    data = request.json or {}

    # Cek apakah barang ada
    existing = query_db("SELECT * FROM barang WHERE barang_id=%s", (id,), fetch=True)
    if not existing:
        return error("Barang tidak ditemukan", 404)

    query_db("""
        UPDATE barang SET
            nama_barang=%s, kategori=%s, jenis_barang=%s, watt=%s,
            harga_beli=%s, stok_minimum=%s, stok_saat_ini=%s,
            terjual_online=%s, terjual_offline=%s, keterangan=%s
        WHERE barang_id=%s
    """, (
        data.get("nama_barang"),
        data.get("kategori", ""),
        data.get("jenis_barang", ""),
        data.get("watt", 0),
        data.get("harga_beli", 0),
        data.get("stok_minimum", 0),
        data.get("stok_saat_ini", 0),
        data.get("terjual_online", 0),
        data.get("terjual_offline", 0),
        data.get("keterangan", ""),
        id
    ))

    return success(message="Barang berhasil diperbarui")


# ======================================================================
# PARTIAL UPDATE (PATCH) -> Update sebagian field saja
# ======================================================================
@bp.route("/<int:id>", methods=["PATCH"])
def patch_barang(id):
    data = request.json or {}

    existing = query_db("SELECT * FROM barang WHERE barang_id=%s", (id,), fetch=True)
    if not existing:
        return error("Barang tidak ditemukan", 404)

    # Build dynamic query
    fields = []
    values = []

    for key, value in data.items():
        fields.append(f"{key}=%s")
        values.append(value)

    if not fields:
        return error("Tidak ada field yang dikirim")

    values.append(id)

    query_db(f"UPDATE barang SET {', '.join(fields)} WHERE barang_id=%s", values)

    return success(message="Barang berhasil diupdate sebagian")


# ======================================================================
# DELETE BARANG
# ======================================================================
@bp.route("/<int:id>", methods=["DELETE"])
def delete_barang(id):
    existing = query_db("SELECT * FROM barang WHERE barang_id=%s", (id,), fetch=True)
    if not existing:
        return error("Barang tidak ditemukan", 404)

    query_db("DELETE FROM barang WHERE barang_id=%s", (id,))
    return success(message="Barang berhasil dihapus")
