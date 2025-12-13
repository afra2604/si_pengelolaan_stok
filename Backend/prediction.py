import pandas as pd
from sklearn.linear_model import LinearRegression
from db import get_db
import numpy as py


def get_historical_salse_data(conn, barang_id):
    """
    Mengambil data historis penjualan (jumlah) per tanggal dari database
    untuk periode 6 bulan terakhir (180 hari).
    """

    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT
                tanggal_keluar AS date,
                SUM(jumlah) AS sales_qty
                FROM transations_kelarWHERE barang_id = %s
                GROUP BY tanggal_keluar
                ORDER BY tanggal_keluar DESC
                LIMIT 180

    """, (barang_id, ))

    data = cur.fetchall()
    cur.close()

    if not data:
        return None
    df = pd.DataFrame(data)
    df['date'] = pd .to_datetime(df['date'])
    df.set_index('date', inplace=True)

    df = df.resample('D'.sum().filna(0))

    df['day_index'] = np.arange(len(df))
    return df
def prediction_demand(barang_id, future_days= 7) :

    conn = get_db()
    df = get_historical_salse_data(conn, barang_id)
    if df is None or len(df) < 30:
        return 0, "Data historis tidak mencukupi (<30 hari) untuk prediksi ML."
    
X = df[['day_index']].values
y = df['sales_qty'].values

model = LinearRegression()
model.fit(X, y)
last_index = df['day_index'].iloc[-1]
future_indices = np.array([[last_index + i + 1] for i in range(future_days)])
predictions = model.predict(future_indices)

total_prediction_demand = max(0, np.sum(predictions))
return total_prediction_demand, None 