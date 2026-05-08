from flask import Blueprint, jsonify, request

from services.ai_service import generate_ai_pair_payload, generate_ai_payload
from services.evaluation_service import generate_evaluation_result

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/api/ai/recommendation", methods=["POST"])
def generate_ai_recommendation():
    data = request.get_json(silent=True) or {}
    input_weights = data.get("weights", {})
    top_n = int(data.get("top_n", 3) or 3)
    top_n = max(2, min(top_n, 5))

    evaluation_result = generate_evaluation_result(input_weights)
    if not evaluation_result["ranking"]:
        return jsonify({"error": "Chưa có dữ liệu xếp hạng nhà cung cấp."}), 400

    return jsonify(generate_ai_payload(evaluation_result, top_n))


@ai_bp.route("/api/ai/compare", methods=["POST"])
def generate_ai_pair_compare():
    data = request.get_json(silent=True) or {}
    input_weights = data.get("weights", {})
    supplier_a_id = int(data.get("supplier_a_id") or 0)
    supplier_b_id = int(data.get("supplier_b_id") or 0)

    if not supplier_a_id or not supplier_b_id:
        return jsonify({"error": "Thiếu mã nhà cung cấp để so sánh."}), 400
    if supplier_a_id == supplier_b_id:
        return jsonify({"error": "Vui lòng chọn 2 nhà cung cấp khác nhau."}), 400

    evaluation_result = generate_evaluation_result(input_weights)
    ranking = evaluation_result.get("ranking", [])
    supplier_a = next((item for item in ranking if item["ma_ncc"] == supplier_a_id), None)
    supplier_b = next((item for item in ranking if item["ma_ncc"] == supplier_b_id), None)

    if not supplier_a or not supplier_b:
        return jsonify({"error": "Không tìm thấy nhà cung cấp trong kết quả đánh giá."}), 404

    return jsonify(generate_ai_pair_payload(supplier_a, supplier_b))
