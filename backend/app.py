from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg
import math
from psycopg.rows import dict_row

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "he_ho_tro_ra_quyet_dinh",
    "user": "postgres",
    "password": "Chihan0403"
}

def get_connection():
    return psycopg.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        row_factory=dict_row
    )

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "API kết nối PostgreSQL đang hoạt động."})

@app.route("/api/criteria", methods=["GET"])
def get_criteria():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT ma_tieu_chi, ten_tieu_chi, mo_ta
                FROM public.tieu_chi
                ORDER BY ma_tieu_chi
            """)
            criteria = cur.fetchall()
    return jsonify(criteria)

@app.route("/api/suppliers", methods=["GET"])
def get_suppliers():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT ma_ncc, ten_ncc, dia_chi, so_dien_thoai, email, mo_ta
                FROM public.nha_cung_cap
                ORDER BY ma_ncc
            """)
            suppliers = cur.fetchall()
    return jsonify(suppliers)

@app.route("/api/evaluate", methods=["POST"])
def evaluate_suppliers():
    data = request.get_json(silent=True) or {}
    input_weights = data.get("weights", {})

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT ma_tieu_chi, ten_tieu_chi, mo_ta
                FROM public.tieu_chi
                ORDER BY ma_tieu_chi
            """)
            criteria = cur.fetchall()

            cur.execute("""
                SELECT ma_ncc, ten_ncc, dia_chi, so_dien_thoai, email, mo_ta
                FROM public.nha_cung_cap
                ORDER BY ma_ncc
            """)
            suppliers = cur.fetchall()

            cur.execute("""
                SELECT dg.ma_ncc, tc.ten_tieu_chi, tc.mo_ta, dg.diem
                FROM public.danh_gia_ncc dg
                JOIN public.tieu_chi tc ON dg.ma_tieu_chi = tc.ma_tieu_chi
                ORDER BY dg.ma_ncc, tc.ma_tieu_chi
            """)
            all_scores = cur.fetchall()

    # Nếu frontend chưa gửi weights thì chia đều
    db_criteria_names = [c["ten_tieu_chi"] for c in criteria]
    if not input_weights:
        default_weight = round(100 / len(db_criteria_names), 2) if db_criteria_names else 0
        weights = {name: default_weight for name in db_criteria_names}
    else:
        weights = {name: float(input_weights.get(name, 0)) for name in db_criteria_names}

    total_weight = sum(weights.values()) or 1

    score_map_by_supplier = {}
    for row in all_scores:
        ma_ncc = row["ma_ncc"]
        if ma_ncc not in score_map_by_supplier:
            score_map_by_supplier[ma_ncc] = {}
        score_map_by_supplier[ma_ncc][row["ten_tieu_chi"]] = {
            "value": float(row["diem"]),
            "label": row["mo_ta"] or row["ten_tieu_chi"]
        }

    ranking = []
    for supplier in suppliers:
        supplier_scores = score_map_by_supplier.get(supplier["ma_ncc"], {})

        weighted_sum = 0
        criterion_scores = []

        for c in criteria:
            key = c["ten_tieu_chi"]
            label = c["mo_ta"] or key
            value = supplier_scores.get(key, {}).get("value", 0)
            weighted_sum += value * weights.get(key, 0)

            criterion_scores.append({
                "key": key,
                "label": label,
                "value": value,
                "weight": weights.get(key, 0)
            })

        final_score = round(weighted_sum / total_weight, 2)

        ranking.append({
            "ma_ncc": supplier["ma_ncc"],
            "ten_ncc": supplier["ten_ncc"],
            "dia_chi": supplier["dia_chi"],
            "so_dien_thoai": supplier["so_dien_thoai"],
            "email": supplier["email"],
            "mo_ta": supplier["mo_ta"],
            "score": final_score,
            "criterion_scores": criterion_scores
        })

    ranking.sort(key=lambda x: x["score"], reverse=True)

    return jsonify({
        "criteria": criteria,
        "weights": weights,
        "ranking": ranking,
        "best_supplier": ranking[0] if ranking else None
    })

if __name__ == "__main__":
    app.run(debug=True)

@app.route("/api/ahp/matrix", methods=["GET"])
def get_ahp_matrix():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT ma_tieu_chi, ten_tieu_chi, mo_ta
                FROM public.tieu_chi
                ORDER BY ma_tieu_chi
            """)
            criteria = cur.fetchall()

            cur.execute("""
                SELECT tieu_chi_1, tieu_chi_2, gia_tri
                FROM public.so_sanh_cap_ahp
            """)
            rows = cur.fetchall()

    n = len(criteria)
    id_list = [c["ma_tieu_chi"] for c in criteria]

    matrix = {i: {j: 1.0 for j in id_list} for i in id_list}
    for row in rows:
        matrix[row["tieu_chi_1"]][row["tieu_chi_2"]] = float(row["gia_tri"])

    return jsonify({
        "criteria": criteria,
        "matrix": matrix
    })

def calculate_ahp_weights(matrix_values):
    n = len(matrix_values)

    # Chuẩn hóa cột
    col_sums = [sum(matrix_values[i][j] for i in range(n)) for j in range(n)]
    normalized = [
        [matrix_values[i][j] / col_sums[j] for j in range(n)]
        for i in range(n)
    ]

    # Trọng số = trung bình hàng
    weights = [sum(normalized[i]) / n for i in range(n)]

    # Tính lambda max
    weighted_sum = []
    for i in range(n):
        s = sum(matrix_values[i][j] * weights[j] for j in range(n))
        weighted_sum.append(s)

    lambda_max = sum(weighted_sum[i] / weights[i] for i in range(n)) / n

    ci = (lambda_max - n) / (n - 1) if n > 1 else 0

    ri_table = {
        1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12,
        6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
        11: 1.51, 12: 1.48, 13: 1.56, 14: 1.57, 15: 1.59
    }
    ri = ri_table.get(n, 1.59)
    cr = ci / ri if ri != 0 else 0

    return {
        "weights": weights,
        "lambda_max": lambda_max,
        "ci": ci,
        "cr": cr
    }

@app.route("/api/ahp/calculate", methods=["POST"])
def calculate_and_save_ahp():
    data = request.get_json(silent=True) or {}
    matrix = data.get("matrix", {})
    criteria = data.get("criteria", [])

    if not matrix or not criteria:
        return jsonify({"error": "Thiếu dữ liệu ma trận hoặc tiêu chí."}), 400

    n = len(criteria)
    ids = [int(c["ma_tieu_chi"]) for c in criteria]

    matrix_values = []
    for i in ids:
        row = []
        for j in ids:
            row.append(float(matrix[str(i)][str(j)] if str(i) in matrix and str(j) in matrix[str(i)] else matrix[i][j]))
        matrix_values.append(row)

    result = calculate_ahp_weights(matrix_values)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM public.so_sanh_cap_ahp;")
            cur.execute("DELETE FROM public.trong_so_tieu_chi;")

            for r_idx, i in enumerate(ids):
                for c_idx, j in enumerate(ids):
                    cur.execute("""
                        INSERT INTO public.so_sanh_cap_ahp (tieu_chi_1, tieu_chi_2, gia_tri)
                        VALUES (%s, %s, %s)
                    """, (i, j, matrix_values[r_idx][c_idx]))

            for idx, criterion_id in enumerate(ids):
                cur.execute("""
                    INSERT INTO public.trong_so_tieu_chi (ma_tieu_chi, trong_so)
                    VALUES (%s, %s)
                """, (criterion_id, float(result["weights"][idx])))

        conn.commit()

    return jsonify({
        "message": "Đã lưu ma trận AHP và trọng số tiêu chí.",
        "weights": [
            {
                "ma_tieu_chi": ids[idx],
                "trong_so": round(result["weights"][idx], 6)
            }
            for idx in range(len(ids))
        ],
        "lambda_max": round(result["lambda_max"], 6),
        "ci": round(result["ci"], 6),
        "cr": round(result["cr"], 6)
    })

@app.route("/api/ahp/weights", methods=["GET"])
def get_ahp_weights():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT ts.ma_trong_so, ts.ma_tieu_chi, tc.ten_tieu_chi, tc.mo_ta, ts.trong_so
                FROM public.trong_so_tieu_chi ts
                JOIN public.tieu_chi tc ON ts.ma_tieu_chi = tc.ma_tieu_chi
                ORDER BY ts.ma_tieu_chi
            """)
            rows = cur.fetchall()

    return jsonify(rows)