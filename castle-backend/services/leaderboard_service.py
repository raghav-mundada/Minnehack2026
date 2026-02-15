# services/leaderboard_service.py
from __future__ import annotations

from datetime import date, timedelta
from typing import Dict, List, Any, Optional

from supabase_client import supabase


def _dates_backwards(start: date, days: int):
    for i in range(days):
        yield start - timedelta(days=i)


def compute_group_streak(
    group_id: str,
    daily_limit_minutes: int,
    *,
    until: Optional[date] = None,
    lookback_days: int = 90,
) -> int:
    """
    Streak = consecutive calendar days (ending at 'until' or today) where
    total group minutes < limit.

    Missing day => 0 minutes => survived (castle didn't break).
    We only look back 'lookback_days' days (MVP).
    """
    if daily_limit_minutes <= 0:
        return 0

    until = until or date.today()
    start = until - timedelta(days=lookback_days - 1)

    # Pull usage logs in the window
    resp = (
        supabase.table("usage_logs")
        .select("log_date,minutes")
        .eq("group_id", group_id)
        .gte("log_date", start.isoformat())
        .lte("log_date", until.isoformat())
        .execute()
    )

    rows = resp.data or []

    # Sum minutes per day
    totals: Dict[str, int] = {}
    for r in rows:
        d = r["log_date"]  # "YYYY-MM-DD"
        totals[d] = totals.get(d, 0) + int(r["minutes"])

    # Count consecutive survived days ending at 'until'
    streak = 0
    for d in _dates_backwards(until, lookback_days):
        day_key = d.isoformat()
        used = totals.get(day_key, 0)
        survived = used < daily_limit_minutes
        if survived:
            streak += 1
        else:
            break

    return streak


def get_groups_basic() -> List[Dict[str, Any]]:
    resp = (
        supabase.table("groups")
        .select("id,name,daily_limit_minutes")
        .execute()
    )
    return resp.data or []
