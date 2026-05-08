from db import get_connection
from services.supplier_profile_service import enrich_supplier_profile


def fetch_criteria(cur):
    cur.execute(
        """
        SELECT ma_tieu_chi, ten_tieu_chi, mo_ta
        FROM public.tieu_chi
        ORDER BY ma_tieu_chi
        """
    )
    return cur.fetchall()


def fetch_saved_weights(cur):
    cur.execute(
        """
        SELECT tc.ten_tieu_chi, tc.mo_ta, ts.trong_so
        FROM public.trong_so_tieu_chi ts
        JOIN public.tieu_chi tc ON ts.ma_tieu_chi = tc.ma_tieu_chi
        ORDER BY ts.ma_tieu_chi
        """
    )
    return cur.fetchall()


def normalize_weight_map(criteria, input_weights, saved_weights):
    criteria_names = [criterion["ten_tieu_chi"] for criterion in criteria]

    if input_weights:
        weights = {name: float(input_weights.get(name, 0)) for name in criteria_names}
        source = "manual"
    elif saved_weights:
        weights = {
            row["ten_tieu_chi"]: round(float(row["trong_so"]) * 100, 4)
            for row in saved_weights
        }
        source = "ahp"
    else:
        default_weight = round(100 / len(criteria_names), 4) if criteria_names else 0
        weights = {name: default_weight for name in criteria_names}
        source = "default"

    return weights, source


def generate_evaluation_result(input_weights):
    with get_connection() as conn:
        with conn.cursor() as cur:
            criteria = fetch_criteria(cur)
            saved_weights = fetch_saved_weights(cur)

            cur.execute(
                """
                SELECT
                    ma_ncc,
                    ten_ncc,
                    dia_chi,
                    so_dien_thoai,
                    email,
                    mo_ta
                FROM public.nha_cung_cap
                ORDER BY ma_ncc
                """
            )
            suppliers = [enrich_supplier_profile(item) for item in cur.fetchall()]

            cur.execute(
                """
                SELECT dg.ma_ncc, tc.ten_tieu_chi, tc.mo_ta, dg.diem
                FROM public.danh_gia_ncc dg
                JOIN public.tieu_chi tc ON dg.ma_tieu_chi = tc.ma_tieu_chi
                ORDER BY dg.ma_ncc, tc.ma_tieu_chi
                """
            )
            all_scores = cur.fetchall()

    weights, weight_source = normalize_weight_map(criteria, input_weights, saved_weights)
    total_weight = sum(weights.values()) or 1

    score_map_by_supplier = {}
    for row in all_scores:
        supplier_id = row["ma_ncc"]
        score_map_by_supplier.setdefault(supplier_id, {})
        score_map_by_supplier[supplier_id][row["ten_tieu_chi"]] = {
            "value": float(row["diem"]),
            "label": row["mo_ta"] or row["ten_tieu_chi"],
        }

    ranking = []
    for supplier in suppliers:
        supplier_scores = score_map_by_supplier.get(supplier["ma_ncc"], {})
        weighted_sum = 0.0
        criterion_scores = []

        for criterion in criteria:
            key = criterion["ten_tieu_chi"]
            label = criterion["mo_ta"] or key
            value = supplier_scores.get(key, {}).get("value", 0.0)
            weight = weights.get(key, 0.0)
            weighted_sum += value * weight

            criterion_scores.append(
                {
                    "key": key,
                    "label": label,
                    "value": value,
                    "weight": weight,
                }
            )

        ranking.append(
            {
                "ma_ncc": supplier["ma_ncc"],
                "ten_ncc": supplier["ten_ncc"],
                "dia_chi": supplier["dia_chi"],
                "so_dien_thoai": supplier["so_dien_thoai"],
                "email": supplier["email"],
                "mo_ta": supplier["mo_ta"],
                "score": round(weighted_sum / total_weight, 2),
                "criterion_scores": criterion_scores,
            }
        )

    ranking.sort(key=lambda item: item["score"], reverse=True)

    return {
        "criteria": criteria,
        "weights": weights,
        "weight_source": weight_source,
        "ranking": ranking,
        "best_supplier": ranking[0] if ranking else None,
    }
