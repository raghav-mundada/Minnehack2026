# services/status_service.py
from typing import Dict, Any, List, Optional
from datetime import date

from supabase_client import supabase


def get_group(group_id: str) -> Dict[str, Any]:
    resp = (
        supabase.table("groups")
        .select("id,name,daily_limit_minutes")
        .eq("id", group_id)
        .limit(1)
        .execute()
    )
    if not resp.data:
        return {}
    return resp.data[0]


def get_member_totals(group_id: str, log_date: str) -> List[Dict[str, Any]]:
    # Returns: [{"email": "...", "total_minutes": 123}, ...]
    resp = (
        supabase.rpc(
            "member_totals_for_day",
            {"p_group_id": group_id, "p_log_date": log_date},
        )
        .execute()
    )
    return resp.data or []


def get_member_totals_fallback(group_id: str, log_date: str) -> List[Dict[str, Any]]:
    """
    No RPC version: uses usage_logs table directly.
    """
    resp = (
        supabase.table("usage_logs")
        .select("email,minutes")
        .eq("group_id", group_id)
        .eq("log_date", log_date)
        .execute()
    )
    rows = resp.data or []
    totals: Dict[str, int] = {}
    for r in rows:
        email = r["email"]
        totals[email] = totals.get(email, 0) + int(r["minutes"])
    return [{"email": e, "total_minutes": m} for e, m in totals.items()]
