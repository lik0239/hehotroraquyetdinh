import os

AI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "he_ho_tro_ra_quyet_dinh",
    "user": "postgres",
    "password": "Chihan0403",
}

RI_TABLE = {
    1: 0.00,
    2: 0.00,
    3: 0.58,
    4: 0.90,
    5: 1.12,
    6: 1.24,
    7: 1.32,
    8: 1.41,
    9: 1.45,
    10: 1.49,
    11: 1.51,
    12: 1.48,
    13: 1.56,
    14: 1.57,
    15: 1.59,
}
