# services/group_service.py
from typing import Optional, Dict, Any
from postgrest.exceptions import APIError

from supabase_client import supabase


def get_group_by_invite_code(invite_code: str) -> Optional[Dict[str, Any]]:
    resp = (
        supabase.table("groups")
        .select("id,name,daily_limit_minutes,invite_code")
        .eq("invite_code", invite_code)
        .limit(1)
        .execute()
    )
    return resp.data[0] if resp.data else None


def add_member_to_group(group_id: str, email: str) -> Dict[str, Any]:
    """
    Idempotent: if (group_id, email) already exists, do nothing and return success.
    Requires group_members primary key (group_id, email).
    """
    row = {"group_id": group_id, "email": email}

    try:
        # on_conflict targets composite key columns
        supabase.table("group_members").upsert(row, on_conflict="group_id,email").execute()
        return {"joined": True}
    except APIError as e:
        # If you ever see weird constraint errors, bubble details
        raise e


def find_existing_group_for_email(email: str) -> Optional[str]:
    """
    MVP helper: enforce one group per email (optional).
    Returns group_id if found.
    """
    resp = (
        supabase.table("group_members")
        .select("group_id")
        .eq("email", email)
        .limit(1)
        .execute()
    )
    return resp.data[0]["group_id"] if resp.data else None
