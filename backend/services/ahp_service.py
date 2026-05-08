from config import RI_TABLE
from db import get_connection
from services.evaluation_service import fetch_criteria, fetch_saved_weights


def build_default_ahp_matrix(criteria, rows):
    ids = [criterion["ma_tieu_chi"] for criterion in criteria]
    matrix = {str(i): {str(j): 1.0 for j in ids} for i in ids}

    for row in rows:
        i = str(row["tieu_chi_1"])
        j = str(row["tieu_chi_2"])
        value = float(row["gia_tri"] or 1)
        matrix[i][j] = value
        if value != 0:
            matrix[j][i] = round(1 / value, 6)

    return matrix


def calculate_ahp_weights(matrix_values):
    n = len(matrix_values)
    if n == 0:
        return {"weights": [], "lambda_max": 0.0, "ci": 0.0, "cr": 0.0}

    col_sums = [sum(matrix_values[i][j] for i in range(n)) for j in range(n)]
    normalized = [
        [
            (matrix_values[i][j] / col_sums[j]) if col_sums[j] else 0
            for j in range(n)
        ]
        for i in range(n)
    ]

    weights = [sum(normalized[i]) / n for i in range(n)]
    weighted_sum = [
        sum(matrix_values[i][j] * weights[j] for j in range(n)) for i in range(n)
    ]

    lambda_terms = [
        (weighted_sum[i] / weights[i]) for i in range(n) if weights[i] != 0
    ]
    lambda_max = sum(lambda_terms) / len(lambda_terms) if lambda_terms else 0.0
    ci = (lambda_max - n) / (n - 1) if n > 1 else 0.0
    ri = RI_TABLE.get(n, 1.59)
    cr = ci / ri if ri else 0.0

    return {
        "weights": weights,
        "lambda_max": lambda_max,
        "ci": ci,
        "cr": cr,
    }


def build_matrix_values(matrix, ids):
    matrix_values = []
    for i in ids:
        row = []
        for j in ids:
            row_data = matrix.get(str(i), matrix.get(i, {}))
            value = row_data.get(str(j), row_data.get(j, 1))
            row.append(float(value))
        matrix_values.append(row)
    return matrix_values


def get_ahp_matrix_payload():
    with get_connection() as conn:
        with conn.cursor() as cur:
            criteria = fetch_criteria(cur)
            cur.execute(
                """
                SELECT tieu_chi_1, tieu_chi_2, gia_tri
                FROM public.so_sanh_cap_ahp
                """
            )
            matrix_rows = cur.fetchall()
            saved_weights = fetch_saved_weights(cur)

    matrix = build_default_ahp_matrix(criteria, matrix_rows)
    return {
        "criteria": criteria,
        "matrix": matrix,
        "saved_weights": [
            {
                "ten_tieu_chi": row["ten_tieu_chi"],
                "mo_ta": row["mo_ta"],
                "trong_so": round(float(row["trong_so"]), 6),
                "phan_tram": round(float(row["trong_so"]) * 100, 2),
            }
            for row in saved_weights
        ],
    }


def calculate_and_save_ahp(matrix, criteria):
    ids = [int(criterion["ma_tieu_chi"]) for criterion in criteria]
    matrix_values = build_matrix_values(matrix, ids)

    for row_index, row in enumerate(matrix_values):
        for col_index, value in enumerate(row):
            if value <= 0:
                return None, (
                    f"Gia tri tai vi tri ({ids[row_index]}, {ids[col_index]}) phai lon hon 0."
                )

    result = calculate_ahp_weights(matrix_values)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM public.so_sanh_cap_ahp")
            cur.execute("DELETE FROM public.trong_so_tieu_chi")

            for row_index, criterion_i in enumerate(ids):
                for col_index, criterion_j in enumerate(ids):
                    cur.execute(
                        """
                        INSERT INTO public.so_sanh_cap_ahp (tieu_chi_1, tieu_chi_2, gia_tri)
                        VALUES (%s, %s, %s)
                        """,
                        (criterion_i, criterion_j, matrix_values[row_index][col_index]),
                    )

            for index, criterion_id in enumerate(ids):
                cur.execute(
                    """
                    INSERT INTO public.trong_so_tieu_chi (ma_tieu_chi, trong_so)
                    VALUES (%s, %s)
                    """,
                    (criterion_id, float(result["weights"][index])),
                )
        conn.commit()

    payload = {
        "message": "Da luu ma tran AHP va trong so tieu chi.",
        "weights": [
            {
                "ma_tieu_chi": ids[index],
                "trong_so": round(result["weights"][index], 6),
                "phan_tram": round(result["weights"][index] * 100, 2),
            }
            for index in range(len(ids))
        ],
        "lambda_max": round(result["lambda_max"], 6),
        "ci": round(result["ci"], 6),
        "cr": round(result["cr"], 6),
    }
    return payload, None


def get_ahp_weights_rows():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT ts.ma_trong_so, ts.ma_tieu_chi, tc.ten_tieu_chi, tc.mo_ta, ts.trong_so
                FROM public.trong_so_tieu_chi ts
                JOIN public.tieu_chi tc ON ts.ma_tieu_chi = tc.ma_tieu_chi
                ORDER BY ts.ma_tieu_chi
                """
            )
            return cur.fetchall()
