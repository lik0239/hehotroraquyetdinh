import re
import unicodedata


COMPANY_STEMS = [
    "An Phúc",
    "Minh Long",
    "Việt Tiến",
    "Thành Đạt",
    "Hoàng Gia",
    "Phú Mỹ",
    "Nam Sơn",
    "Bảo Tín",
    "Sài Gòn Tech",
    "Mekong Supply",
]

COMPANY_SUFFIXES = ["Công ty TNHH", "Công ty Cổ phần", "Thương mại", "Logistics", "Công nghiệp"]

STREETS = [
    "Nguyễn Văn Linh",
    "Điện Biên Phủ",
    "Lê Duẩn",
    "Võ Văn Kiệt",
    "Phạm Văn Đồng",
    "Trần Hưng Đạo",
]

DISTRICTS = ["Quận 1", "Quận 3", "Quận 7", "Quận 10", "Bình Thạnh", "Thủ Đức"]

CITIES = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Bình Dương", "Đồng Nai"]

INDUSTRIES = [
    "vật tư công nghiệp",
    "bao bì và đóng gói",
    "linh kiện điện tử",
    "thiết bị cơ khí",
    "logistics và kho vận",
    "nguyên liệu sản xuất",
]


def _ascii_fold(value):
    if not value:
        return ""
    normalized = unicodedata.normalize("NFKD", str(value))
    return "".join(ch for ch in normalized if not unicodedata.combining(ch)).lower()


def _is_placeholder_name(name):
    folded = _ascii_fold(name)
    if not folded:
        return True
    raw = str(name or "")
    if "NhÃ  cung" in raw or "Nha cung cap" in raw:
        return True
    return bool(re.match(r"^(nha cung cap|supplier)\s*\d+$", folded))


def _is_placeholder_address(address):
    folded = _ascii_fold(address)
    return (not folded) or folded.startswith("dia chi so ")


def _is_placeholder_phone(phone):
    folded = _ascii_fold(phone)
    return (not folded) or bool(re.match(r"^0900\d{6}$", folded))


def _is_placeholder_email(email):
    folded = _ascii_fold(email)
    return (not folded) or bool(re.match(r"^ncc\d+@supplier\.vn$", folded))


def _is_placeholder_description(description):
    folded = _ascii_fold(description)
    raw = str(description or "")
    return (
        (not folded)
        or ("supplier_ranking_grades.xlsx" in folded)
        or ("ho so nha cung cap" in folded)
        or ("Import tá»«" in raw)
    )


def _generated_name(supplier_id):
    stem = COMPANY_STEMS[(supplier_id - 1) % len(COMPANY_STEMS)]
    suffix = COMPANY_SUFFIXES[((supplier_id - 1) // len(COMPANY_STEMS)) % len(COMPANY_SUFFIXES)]
    return f"{stem} {suffix}"


def _generated_address(supplier_id):
    house_no = 10 + (supplier_id * 7 % 230)
    street = STREETS[(supplier_id - 1) % len(STREETS)]
    district = DISTRICTS[(supplier_id - 1) % len(DISTRICTS)]
    city = CITIES[(supplier_id - 1) % len(CITIES)]
    return f"{house_no} {street}, {district}, {city}"


def _generated_phone(supplier_id):
    return f"09{(10000000 + supplier_id):08d}"


def _generated_email(supplier_id, company_name):
    local = _ascii_fold(company_name)
    local = re.sub(r"[^a-z0-9]+", ".", local).strip(".")
    if not local:
        local = f"ncc{supplier_id}"
    return f"{local}{supplier_id}@example.vn"


def _generated_description(supplier_id):
    industry = INDUSTRIES[(supplier_id - 1) % len(INDUSTRIES)]
    years = 4 + (supplier_id % 10)
    return (
        f"Nhà cung cấp chuyên {industry}, "
        f"kinh nghiệm {years} năm, năng lực giao hàng toàn quốc."
    )


def enrich_supplier_profile(row):
    supplier = dict(row)
    supplier_id = int(supplier.get("ma_ncc") or 0)
    if supplier_id <= 0:
        return supplier

    if _is_placeholder_name(supplier.get("ten_ncc")):
        supplier["ten_ncc"] = _generated_name(supplier_id)

    if _is_placeholder_address(supplier.get("dia_chi")):
        supplier["dia_chi"] = _generated_address(supplier_id)

    if _is_placeholder_phone(supplier.get("so_dien_thoai")):
        supplier["so_dien_thoai"] = _generated_phone(supplier_id)

    if _is_placeholder_email(supplier.get("email")):
        supplier["email"] = _generated_email(supplier_id, supplier["ten_ncc"])

    if _is_placeholder_description(supplier.get("mo_ta")):
        supplier["mo_ta"] = _generated_description(supplier_id)

    return supplier
