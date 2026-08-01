import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("SUPABASE_ANON_KEY", ""))

# Depending on your setup, you can also use SQLAlchemy to connect to Postgres directly.
# For now, we initialize the Supabase client.
supabase: Client | None = None
if url and key:
    supabase = create_client(url, key)
else:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not found in environment.")

def get_supabase() -> Client:
    if not supabase:
        raise ValueError("Supabase client is not configured")
    return supabase
