from flask import Blueprint, jsonify, request

from db import get_connection
from services.evaluation_service import fetch_criteria
from services.supplier_profile_service import enrich_supplier_profile

core_bp = Blueprint("core", __name__)


@core_bp.route("/", methods=["GET"])
def home():
    return jsonify({"message": "API ket noi PostgreSQL dang hoat dong."})


@core_bp.route("/api/criteria", methods=["GET"])
def get_criteria():
    with get_connection() as conn:
        with conn.cursor() as cur:
            criteria = fetch_criteria(cur)
    return jsonify(criteria)


@core_bp.route("/api/suppliers", methods=["GET"])
def get_suppliers():
    with get_connection() as conn:
        with conn.cursor() as cur:
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
    return jsonify(suppliers)


@core_bp.route("/api/suppliers/<int:supplier_id>", methods=["PUT"])
def update_supplier(supplier_id):
    data = request.get_json(silent=True) or {}

    ten_ncc = (data.get("ten_ncc") or "").strip()
    dia_chi = (data.get("dia_chi") or "").strip()
    so_dien_thoai = (data.get("so_dien_thoai") or "").strip()
    email = (data.get("email") or "").strip()
    mo_ta = (data.get("mo_ta") or "").strip()

    if not ten_ncc:
        return jsonify({"error": "Ten nha cung cap khong duoc de trong."}), 400

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE public.nha_cung_cap
                SET ten_ncc = %s,
                    dia_chi = %s,
                    so_dien_thoai = %s,
                    email = %s,
                    mo_ta = %s
                WHERE ma_ncc = %s
                RETURNING ma_ncc, ten_ncc, dia_chi, so_dien_thoai, email, mo_ta
                """,
                (
                    ten_ncc,
                    dia_chi or None,
                    so_dien_thoai or None,
                    email or None,
                    mo_ta or None,
                    supplier_id,
                ),
            )
            updated_supplier = cur.fetchone()
        conn.commit()

    if not updated_supplier:
        return jsonify({"error": "Khong tim thay nha cung cap."}), 404

    return jsonify(updated_supplier)
