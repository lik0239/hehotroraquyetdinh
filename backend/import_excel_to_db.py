from openpyxl import load_workbook
import psycopg

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "he_ho_tro_ra_quyet_dinh",
    "user": "postgres",
    "password": "Chihan0403"
}

EXCEL_FILE = r"..\supplier_ranking_grades.xlsx"

HEADER_TO_DB_NAME = {
    "chất lượng": "quality",
    "số lượng": "quantity",
    "điều kiện và phương thức thanh toán": "conditions_and_method_of_payment",
    "khả năng phục vụ và giao tiếp của nhà cung cấp": "serviceability_and_communicativeness_of_the_supplier",
    "uy tín và năng lực của nhà cung cấp": "reputation_of_the_supplier_and_its_competence",
    "tính linh hoạt": "flexibility",
    "tình hình tài chính của nhà cung cấp": "financial_condition_of_the_supplier",
    "tình trạng tài sản của nhà cung cấp": "condition_of_the_supplier_assets",
    "kết quả kinh doanh và số lượng nhân viên": "business_results_and_number_of_employees",
    "giá": "price",
    "thời gian giao hàng": "delivery_time",
    "vị trí và kết nối giao thông của nhà cung cấp": "supplier_location_and_traffic_connections"
}

def main():
    wb = load_workbook(EXCEL_FILE, data_only=True)
    ws = wb[wb.sheetnames[0]]

    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        print("File Excel rỗng.")
        return

    headers = [str(h).strip().lower() if h is not None else "" for h in rows[0]]
    print("Sheet đang đọc:", wb.sheetnames[0])
    print("Headers:", headers)
    print("Số dòng dữ liệu:", len(rows) - 1)

    with psycopg.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"]
    ) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT ma_tieu_chi, ten_tieu_chi FROM public.tieu_chi ORDER BY ma_tieu_chi;")
            criteria_rows = cur.fetchall()
            criteria_map = {name: ma for ma, name in criteria_rows}

            print("Tiêu chí trong DB:", criteria_map)

            cur.execute("DELETE FROM public.danh_gia_ncc;")

            inserted = 0

            for row in rows[1:]:
                if row[0] is None:
                    continue

                supplier_id = int(row[0])

                for col_idx in range(1, len(headers)):
                    header = headers[col_idx]
                    mapped_name = HEADER_TO_DB_NAME.get(header)

                    if not mapped_name:
                        continue

                    if mapped_name not in criteria_map:
                        print(f"Không tìm thấy tiêu chí trong DB: {mapped_name}")
                        continue

                    diem = row[col_idx]
                    if diem is None:
                        continue

                    ma_tieu_chi = criteria_map[mapped_name]

                    cur.execute("""
                        INSERT INTO public.danh_gia_ncc (ma_ncc, ma_tieu_chi, diem)
                        VALUES (%s, %s, %s)
                    """, (supplier_id, ma_tieu_chi, float(diem)))

                    inserted += 1

        conn.commit()

    print(f"Import thành công {inserted} dòng vào bảng danh_gia_ncc.")

if __name__ == "__main__":
    main()