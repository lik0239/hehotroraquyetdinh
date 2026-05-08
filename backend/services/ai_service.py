import json
from datetime import datetime, timezone

from config import AI_MODEL, OPENAI_API_KEY

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None

openai_client = OpenAI(api_key=OPENAI_API_KEY) if (OpenAI and OPENAI_API_KEY) else None


def build_ai_context(evaluation_result, top_n):
    top_suppliers = evaluation_result["ranking"][:top_n]
    compact_suppliers = []

    for supplier in top_suppliers:
        sorted_criteria = sorted(
            supplier.get("criterion_scores", []),
            key=lambda item: (item.get("value", 0), item.get("weight", 0)),
            reverse=True,
        )
        compact_suppliers.append(
            {
                "ma_ncc": supplier["ma_ncc"],
                "ten_ncc": supplier["ten_ncc"],
                "score": supplier["score"],
                "top_strengths": sorted_criteria[:3],
                "watch_out": list(reversed(sorted_criteria[-3:])),
            }
        )

    return {
        "weight_source": evaluation_result["weight_source"],
        "weights": evaluation_result["weights"],
        "top_suppliers": compact_suppliers,
    }


def build_rule_based_recommendation(evaluation_result):
    ranking = evaluation_result.get("ranking", [])
    best_supplier = ranking[0] if ranking else None

    if not best_supplier:
        return {
            "summary": "Chưa có dữ liệu để phân tích.",
            "reasons": [],
            "risks": [],
            "action_plan": [],
            "compare_top2": "Không đủ dữ liệu để so sánh.",
        }

    second_supplier = ranking[1] if len(ranking) > 1 else None
    sorted_criteria = sorted(
        best_supplier.get("criterion_scores", []),
        key=lambda item: item.get("value", 0),
        reverse=True,
    )
    strengths = sorted_criteria[:3]
    weaknesses = list(reversed(sorted_criteria[-2:]))

    reasons = [
        (
            f"{best_supplier['ten_ncc']} đang dẫn đầu với điểm "
            f"{best_supplier['score']:.2f}/100 theo bộ trọng số hiện tại."
        )
    ]
    reasons.extend(
        [
            (
                f"Điểm mạnh tiêu chí '{item['label']}': {item['value']:.2f} "
                f"(trọng số {item['weight']:.2f}%)."
            )
            for item in strengths
        ]
    )

    risks = [
        (
            f"Tiêu chí cần theo dõi '{item['label']}': điểm {item['value']:.2f}. "
            "Cần kế hoạch cải thiện để tránh ảnh hưởng tổng điểm."
        )
        for item in weaknesses
    ]

    compare_top2 = "Không có đối thủ thứ hai để so sánh."
    if second_supplier:
        gap = best_supplier["score"] - second_supplier["score"]
        compare_top2 = (
            f"{best_supplier['ten_ncc']} cao hơn {second_supplier['ten_ncc']} "
            f"{gap:.2f} điểm."
        )

    return {
        "summary": (
            f"Đề xuất ưu tiên {best_supplier['ten_ncc']} do có điểm tổng hợp cao nhất."
        ),
        "reasons": reasons,
        "risks": risks,
        "action_plan": [
            "Xác minh năng lực giao hàng bằng dữ liệu hợp đồng gần nhất.",
            "Thực hiện đánh giá pháp lý và điều khoản thanh toán trước phê duyệt.",
            "Thiết lập KPI theo dõi 3 tiêu chí yếu sau khi ký hợp đồng.",
        ],
        "compare_top2": compare_top2,
    }


def call_openai_recommendation(context):
    if not openai_client:
        raise RuntimeError("OpenAI client chưa được cấu hình.")

    system_prompt = (
        "Bạn là chuyên gia mua hàng doanh nghiệp. "
        "Chỉ sử dụng dữ liệu được cung cấp, không được tự bổ sung. "
        "Trả về duy nhất một JSON hợp lệ với các trường: "
        "summary (string), reasons (array string), risks (array string), "
        "action_plan (array string), compare_top2 (string). "
        "Văn phong tiếng Việt, ngắn gọn, trọng tâm, để trình phê duyệt."
    )
    user_prompt = (
        "Hãy phân tích và đưa ra giải thích đề xuất nhà cung cấp.\n"
        f"Dữ liệu đầu vào:\n{json.dumps(context, ensure_ascii=False)}"
    )

    response = openai_client.responses.create(
        model=AI_MODEL,
        input=[
            {"role": "system", "content": [{"type": "input_text", "text": system_prompt}]},
            {"role": "user", "content": [{"type": "input_text", "text": user_prompt}]},
        ],
    )

    output_text = response.output_text.strip()
    if output_text.startswith("```"):
        lines = output_text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        output_text = "\n".join(lines).strip()
        if output_text.lower().startswith("json"):
            output_text = output_text[4:].strip()
    parsed = json.loads(output_text)

    return {
        "summary": parsed.get("summary", ""),
        "reasons": parsed.get("reasons", []),
        "risks": parsed.get("risks", []),
        "action_plan": parsed.get("action_plan", []),
        "compare_top2": parsed.get("compare_top2", ""),
    }


def generate_ai_payload(evaluation_result, top_n):
    context = build_ai_context(evaluation_result, top_n)
    fallback = build_rule_based_recommendation(evaluation_result)

    try:
        ai_result = call_openai_recommendation(context)
        source = "openai"
    except Exception as exc:  # pragma: no cover
        ai_result = fallback
        source = "rule_based"
        ai_result["warning"] = f"Không gọi được AI: {str(exc)}"

    ai_result["source"] = source
    ai_result["model"] = AI_MODEL if source == "openai" else None
    ai_result["generated_at"] = datetime.now(timezone.utc).isoformat()
    ai_result["best_supplier"] = evaluation_result["best_supplier"]
    return ai_result


def build_pair_context(supplier_a, supplier_b):
    def compact_supplier(supplier):
        criteria = sorted(
            supplier.get("criterion_scores", []),
            key=lambda item: item.get("value", 0),
            reverse=True,
        )
        return {
            "ma_ncc": supplier["ma_ncc"],
            "ten_ncc": supplier["ten_ncc"],
            "score": supplier["score"],
            "top_strengths": criteria[:4],
            "watch_out": list(reversed(criteria[-3:])),
        }

    return {
        "supplier_a": compact_supplier(supplier_a),
        "supplier_b": compact_supplier(supplier_b),
    }


def build_rule_based_pair_comparison(supplier_a, supplier_b):
    score_a = float(supplier_a.get("score", 0))
    score_b = float(supplier_b.get("score", 0))
    winner = supplier_a if score_a >= score_b else supplier_b
    loser = supplier_b if winner is supplier_a else supplier_a
    gap = abs(score_a - score_b)

    a_map = {item["key"]: item for item in supplier_a.get("criterion_scores", [])}
    b_map = {item["key"]: item for item in supplier_b.get("criterion_scores", [])}
    diffs = []
    for key in a_map.keys():
        if key not in b_map:
            continue
        av = float(a_map[key].get("value", 0))
        bv = float(b_map[key].get("value", 0))
        diffs.append(
            {
                "criterion": a_map[key].get("label") or key,
                "score_a": round(av, 2),
                "score_b": round(bv, 2),
                "delta": round(av - bv, 2),
            }
        )
    diffs.sort(key=lambda item: abs(item["delta"]), reverse=True)
    top_diffs = diffs[:5]

    return {
        "summary": (
            f"So sánh cặp cho thấy {winner['ten_ncc']} đang nhỉnh hơn "
            f"{loser['ten_ncc']} với chênh lệch {gap:.2f} điểm tổng hợp."
        ),
        "winner": {
            "ma_ncc": winner["ma_ncc"],
            "ten_ncc": winner["ten_ncc"],
            "score": winner["score"],
        },
        "loser": {
            "ma_ncc": loser["ma_ncc"],
            "ten_ncc": loser["ten_ncc"],
            "score": loser["score"],
        },
        "criteria_differences": top_diffs,
        "recommendation": (
            "Ưu tiên đối tác có điểm tổng hợp cao hơn, đồng thời kiểm tra thêm "
            "2-3 tiêu chí chênh lệch lớn trước khi chốt."
        ),
    }


def call_openai_pair_comparison(context):
    if not openai_client:
        raise RuntimeError("OpenAI client chưa được cấu hình.")

    system_prompt = (
        "Bạn là chuyên gia mua hàng B2B. Chỉ dùng dữ liệu được cung cấp. "
        "Trả về JSON hợp lệ với các trường: "
        "summary (string), winner (object), loser (object), "
        "criteria_differences (array object gồm criterion, score_a, score_b, delta), "
        "recommendation (string)."
    )
    user_prompt = (
        "Hãy so sánh 2 nhà cung cấp và đưa ra kết luận rõ ràng.\n"
        f"Dữ liệu:\n{json.dumps(context, ensure_ascii=False)}"
    )

    response = openai_client.responses.create(
        model=AI_MODEL,
        input=[
            {"role": "system", "content": [{"type": "input_text", "text": system_prompt}]},
            {"role": "user", "content": [{"type": "input_text", "text": user_prompt}]},
        ],
    )

    output_text = response.output_text.strip()
    if output_text.startswith("```"):
        lines = output_text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        output_text = "\n".join(lines).strip()
        if output_text.lower().startswith("json"):
            output_text = output_text[4:].strip()

    parsed = json.loads(output_text)
    return {
        "summary": parsed.get("summary", ""),
        "winner": parsed.get("winner", {}),
        "loser": parsed.get("loser", {}),
        "criteria_differences": parsed.get("criteria_differences", []),
        "recommendation": parsed.get("recommendation", ""),
    }


def generate_ai_pair_payload(supplier_a, supplier_b):
    context = build_pair_context(supplier_a, supplier_b)
    fallback = build_rule_based_pair_comparison(supplier_a, supplier_b)

    try:
        result = call_openai_pair_comparison(context)
        source = "openai"
    except Exception as exc:  # pragma: no cover
        result = fallback
        source = "rule_based"
        result["warning"] = f"Không gọi được AI: {str(exc)}"

    result["source"] = source
    result["model"] = AI_MODEL if source == "openai" else None
    result["generated_at"] = datetime.now(timezone.utc).isoformat()
    result["supplier_a"] = {
        "ma_ncc": supplier_a["ma_ncc"],
        "ten_ncc": supplier_a["ten_ncc"],
        "score": supplier_a["score"],
    }
    result["supplier_b"] = {
        "ma_ncc": supplier_b["ma_ncc"],
        "ten_ncc": supplier_b["ten_ncc"],
        "score": supplier_b["score"],
    }
    return result
