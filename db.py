# db.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("GITHUB_TOKEN.env")

_url = os.getenv("SUPABASE_URL", "")
_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# URL/키가 없거나 유효하지 않으면 None — 테스트에서 mock으로 교체됨
try:
    supabase: Client | None = create_client(_url, _key) if _url and _key else None
except Exception as e:
    import warnings
    warnings.warn(f"Supabase 클라이언트 초기화 실패: {e}")
    supabase = None
