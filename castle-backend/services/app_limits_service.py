# services/app_limits_service.py
from typing import Dict, Any, List, Optional
from datetime import date
from supabase_client import supabase


def create_or_update_app_limit(group_id: str, app_name: str, limit_minutes: int) -> Dict[str, Any]:
    """
    Create or update an app time limit for a group.
    Uses upsert to handle both create and update cases.
    """
    row = {
        "group_id": group_id,
        "app_name": app_name.strip(),
        "limit_minutes": limit_minutes,
    }
    
    resp = (
        supabase.table("app_limits")
        .upsert(row, on_conflict="group_id,app_name")
        .execute()
    )
    
    return resp.data[0] if resp.data else row


def get_app_limits(group_id: str) -> List[Dict[str, Any]]:
    """
    Get all app limits for a specific group.
    Returns: [{ app_name, limit_minutes, created_at }, ...]
    """
    resp = (
        supabase.table("app_limits")
        .select("app_name,limit_minutes,created_at")
        .eq("group_id", group_id)
        .execute()
    )
    
    return resp.data or []


def delete_app_limit(group_id: str, app_name: str) -> bool:
    """
    Delete an app limit for a group.
    Returns True if successful.
    """
    resp = (
        supabase.table("app_limits")
        .delete()
        .eq("group_id", group_id)
        .eq("app_name", app_name.strip())
        .execute()
    )
    
    return True


def get_app_usage_for_day(group_id: str, app_name: str, log_date: str) -> int:
    """
    Calculate total usage for a specific app on a specific day.
    Returns total minutes used.
    """
    resp = (
        supabase.table("usage_logs")
        .select("minutes")
        .eq("group_id", group_id)
        .eq("app_name", app_name.strip())
        .eq("log_date", log_date)
        .execute()
    )
    
    rows = resp.data or []
    total = sum(int(r["minutes"]) for r in rows)
    
    return total


def get_all_app_usage(group_id: str, log_date: str) -> List[Dict[str, Any]]:
    """
    Get usage for all apps that have limits set, for a specific day.
    Returns: [{ app_name, limit_minutes, used_minutes, exceeded }, ...]
    """
    # Get all app limits for this group
    limits = get_app_limits(group_id)
    
    result = []
    for limit in limits:
        app_name = limit["app_name"]
        limit_minutes = limit["limit_minutes"]
        
        # Get usage for this app
        used_minutes = get_app_usage_for_day(group_id, app_name, log_date)
        
        result.append({
            "app_name": app_name,
            "limit_minutes": limit_minutes,
            "used_minutes": used_minutes,
            "exceeded": used_minutes >= limit_minutes,
            "usage_percent": min(100, round((used_minutes / limit_minutes) * 100)) if limit_minutes > 0 else 0,
        })
    
    return result
