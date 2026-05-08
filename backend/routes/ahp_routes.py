from flask import Blueprint, jsonify, request

from services.ahp_service import (
    calculate_and_save_ahp,
    get_ahp_matrix_payload,
    get_ahp_weights_rows,
)

ahp_bp = Blueprint("ahp", __name__)


@ahp_bp.route("/api/ahp/matrix", methods=["GET"])
def get_ahp_matrix():
    return jsonify(get_ahp_matrix_payload())


@ahp_bp.route("/api/ahp/calculate", methods=["POST"])
def calculate_and_save_ahp_route():
    data = request.get_json(silent=True) or {}
    matrix = data.get("matrix", {})
    criteria = data.get("criteria", [])

    if not matrix or not criteria:
        return jsonify({"error": "Thieu du lieu ma tran hoac tieu chi."}), 400

    payload, error = calculate_and_save_ahp(matrix, criteria)
    if error:
        return jsonify({"error": error}), 400
    return jsonify(payload)


@ahp_bp.route("/api/ahp/weights", methods=["GET"])
def get_ahp_weights():
    return jsonify(get_ahp_weights_rows())
