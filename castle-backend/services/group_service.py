# services/group_service.py
from typing import Optional, Dict, Any, List
from postgrest.exceptions import APIError
import uuid
import secrets

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


def create_group(name: str, daily_limit_minutes: int, creator_email: str) -> Dict[str, Any]:
    """
    Create a new group with a unique invite code and add the creator as the first member.
    Returns the created group info.
    """
    # Generate unique invite code (8 characters, alphanumeric)
    invite_code = secrets.token_urlsafe(6).upper()[:8]
    
    # Generate unique group ID
    group_id = str(uuid.uuid4())
    
    # Create group in database
    group_data = {
        "id": group_id,
        "name": name,
        "daily_limit_minutes": daily_limit_minutes,
        "invite_code": invite_code,
    }
    
    try:
        supabase.table("groups").insert(group_data).execute()
    except APIError as e:
        # If invite code collision (unlikely), retry once
        if "invite_code" in str(e).lower() or "unique" in str(e).lower():
            invite_code = secrets.token_urlsafe(6).upper()[:8]
            group_data["invite_code"] = invite_code
            supabase.table("groups").insert(group_data).execute()
        else:
            raise e
    
    # Add creator as first member
    add_member_to_group(group_id, creator_email.lower().strip())
    
    return {
        "id": group_id,
        "name": name,
        "daily_limit_minutes": daily_limit_minutes,
        "invite_code": invite_code,
    }


def get_groups_for_email(email: str) -> List[Dict[str, Any]]:
    """
    Get all groups that a user (email) is a member of.
    Returns list of group info.
    """
    # Get all group memberships for this email
    memberships = (
        supabase.table("group_members")
        .select("group_id")
        .eq("email", email.lower().strip())
        .execute()
    )
    
    if not memberships.data:
        return []
    
    group_ids = [m["group_id"] for m in memberships.data]
    
    # Get group details
    groups = (
        supabase.table("groups")
        .select("id,name,daily_limit_minutes,invite_code")
        .in_("id", group_ids)
        .execute()
    )
    
    return groups.data or []
