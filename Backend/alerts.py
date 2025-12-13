# alerts.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from db import get_db
from datetime import datetime, timedelta
import math

bp = Blueprint("alerts", __name__, url_prefix="")


def compute_mvp(stok_saat_ini, stok_minimum):
    """ Metode paling sederhana: Kekurangan = Minimum - Saat ini."""
    return max(0, stok_minimum - stok_saat_ini)

def compute_advanced(conn, barang_id, stok_saat_ini, stok_minimum, lead_time_days=7):
    """Metode ROP berbasis Rata-rata Penjualan Historis (30 hari)."""
    days = 30
    start = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT SUM(jumlah) AS total_keluar FROM transactions_keluar WHERE barang_id=%s AND tanggal_keluar >= %s",
        (barang_id, start)
    )
    r = cur.fetchone()
    total_keluar = r['total_keluar'] or 0
    avg_daily = total_keluar / days
    rop = (avg_daily * lead_time_days) + stok_minimum
    qty_to_buy = max(0, math.ceil(rop - stok_saat_ini))
    cur.close()
    return qty_to_buy, rop, avg_daily, None

def compute_ml(conn, barang_id, stok_saat_ini, stok_minimum, prediction_days=7):
    """Menghitung Qty to Buy berdasarkan prediksi permintaan ML (Linear Regression)."""
    total_predicted_demand, error = predict_demand(barang_id, future_days=prediction_days)

    if error:
        qty_to_buy = compute_mvp(stok_saat_ini, stok_minimum)
        rop_ml = None
        return qty_to_buy, rop_ml, None, f"ML Fallback: {error}"
    
    rop_ml = total_predicted_demand + stok_minimum
    qty_to_buy = max(0, math.ceil(rop_ml - stok_saat_ini))

    avg_daily_predicted = total_predicted_demand / prediction_days if prediction_days > 0 else 0

    return qty_to_buy, rop_ml, avg_daily_predicted, None
    

@bp.route('/alerts', methods=['GET'])
# @jwt_required()
def alerts():
    mode = request.args.get('mode', 'mvp')  # 'mvp' or 'advanced'
    lead = int(request.args.get('lead', 7))

    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT barang_id, nama_barang, stok_saat_ini, stok_minimum, harga_beli FROM barang")
    items = cur.fetchall()
    cur.close()

    results = []
    total_cost = 0


    for it in items:
        stok = it['stok_saat_ini'] or 0
        minimum = it['stok_minimum'] or 0
        qty = 0
        rop = None
        avg_daily = None
        error_msg = None

        if mode == 'advanced':
            qty, rop, avg_daily, error_msg = compute_advanced(conn, it['barang_id'], stok, minimum, lead_time_days=lead)

        elif mode == 'ml':
            qty, rop, avg_daily, error_msg = compute_ml(conn, it['barang_id'], stok, minimum, prediction_days=lead)
        else:
            qty = compute_mvp(stok, minimum)


        if qty > 0:
            cost = qty * float(it['harga_beli'] or 0)
            results.append({
                'barang_id': it['barang_id'],
                'nama_barang': it['nama_barang'],
                'stok_saat_ini': stok,
                'stok_minimum': minimum,
                'qty_to_buy': qty,
                'harga_beli': float(it['harga_beli'] or 0),
                'estimated_cost': cost,
                'rop': rop,
                'avg_daily': avg_daily
                'mode_used': mode,
                'prediction_days': lead,
                'error_msg': error_msg
            })
            total_cost += cost

    return jsonify({'alerts': results, 'total_estimated_cost': total_cost})