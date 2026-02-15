from supabase_client import supabase

def insert_usage_rows(rows):
    if not rows:
        return

    supabase.table("usage_logs").upsert(rows, on_conflict="source_key").execute()

