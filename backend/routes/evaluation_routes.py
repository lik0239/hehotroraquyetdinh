from flask import Blueprint, jsonify, request

from services.evaluation_service import generate_evaluation_result

evaluation_bp = Blueprint("evaluation", __name__)


@evaluation_bp.route("/api/evaluate", methods=["POST"])
def evaluate_suppliers():
    data = request.get_json(silent=True) or {}
    input_weights = data.get("weights", {})
    return jsonify(generate_evaluation_result(input_weights))
