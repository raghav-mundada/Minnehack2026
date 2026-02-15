from fastapi import FastAPI
from pydantic import BaseModel
from services.parser import parse_usage_blob
from services.usage_service import insert_usage_rows
from fastapi import FastAPI, HTTPException
from models.schemas import JoinGroupRequest, CreateGroupRequest
from datetime import date as date_type
from fastapi import Query
from services.leaderboard_service import compute_group_streak, get_groups_basic
from datetime import date as date_type
from fastapi import Query


from services.status_service import get_group, get_member_totals_fallback

from services.group_service import (
    get_group_by_invite_code,
    add_member_to_group,
    find_existing_group_for_email,
    create_group,
    get_groups_for_email,
)


app = FastAPI()

class IngestRequest(BaseModel):
    email: str
    log_date: str
    usage_blob: str


from fastapi import HTTPException
from supabase_client import supabase
from services.parser import parse_usage_blob
from services.usage_service import insert_usage_rows


@app.post("/ingest")
def ingest(data: IngestRequest):

    # 1️⃣ Resolve group via email
    response = supabase.table("group_members") \
        .select("group_id") \
        .eq("email", data.email) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=400, detail="User not in any group")

    group_id = response.data[0]["group_id"]

    # 2️⃣ Parse blob
    rows = parse_usage_blob(
        data.usage_blob,
        group_id,
        data.email,
        data.log_date
    )

    # 3️⃣ Insert into usage_logs
    insert_usage_rows(rows)

    return {"inserted_rows": len(rows)}


@app.post("/join-group")
def join_group(req: JoinGroupRequest):
    code = req.invite_code.strip()
    email = req.email.strip().lower()

    group = get_group_by_invite_code(code)
    if not group:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    # OPTIONAL but recommended for MVP: one email can only be in one group
    existing = find_existing_group_for_email(email)
    if existing and existing != group["id"]:
        raise HTTPException(status_code=400, detail="Email already belongs to another group")

    add_member_to_group(group["id"], email)

    return {
        "group_id": group["id"],
        "group_name": group.get("name"),
        "daily_limit_minutes": group.get("daily_limit_minutes"),
    }

@app.get("/groups/{group_id}/status")
def group_status(group_id: str, date: str = Query(None)):
    # date param optional: defaults to today
    log_date = date or date_type.today().isoformat()

    group = get_group(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    limit = int(group.get("daily_limit_minutes") or 0)
    if limit <= 0:
        raise HTTPException(status_code=400, detail="Group daily limit not set")

    members = get_member_totals_fallback(group_id, log_date)

    used = sum(m["total_minutes"] for m in members)
    alive = used < limit

    # health goes 100 -> 0 as used approaches limit
    health_percent = max(0, round(100 * (1 - used / limit)))

    return {
        "group_id": group_id,
        "date": log_date,
        "limit_minutes": limit,
        "used_minutes": used,
        "health_percent": health_percent,
        "alive": alive,
        "members": sorted(members, key=lambda x: x["total_minutes"], reverse=True),
    }
@app.get("/groups/{group_id}/streak")
def group_streak(group_id: str, lookback_days: int = Query(90, ge=7, le=365)):
    group_resp = (
        supabase.table("groups")
        .select("id,name,daily_limit_minutes")
        .eq("id", group_id)
        .limit(1)
        .execute()
    )
    if not group_resp.data:
        raise HTTPException(status_code=404, detail="Group not found")

    group = group_resp.data[0]
    limit = int(group.get("daily_limit_minutes") or 0)

    streak = compute_group_streak(
        group_id,
        limit,
        until=date_type.today(),
        lookback_days=lookback_days,
    )

    return {
        "group_id": group_id,
        "group_name": group.get("name"),
        "current_streak_days": streak,
        "lookback_days": lookback_days,
    }
@app.get("/leaderboard")
def leaderboard(
    top: int = Query(10, ge=1, le=50),
    lookback_days: int = Query(90, ge=7, le=365),
):
    groups = get_groups_basic()

    items = []
    today = date_type.today()

    for g in groups:
        gid = g["id"]
        limit = int(g.get("daily_limit_minutes") or 0)
        streak = compute_group_streak(gid, limit, until=today, lookback_days=lookback_days)

        items.append({
            "group_id": gid,
            "group_name": g.get("name"),
            "current_streak_days": streak,
        })

    items.sort(key=lambda x: x["current_streak_days"], reverse=True)

    return {
        "top": top,
        "lookback_days": lookback_days,
        "leaderboard": items[:top],
    }


@app.post("/create-group")
def create_group_endpoint(req: CreateGroupRequest):
    """
    Create a new group and return the invite code.
    The creator is automatically added as the first member.
    """
    email = req.creator_email.strip().lower()
    
    # Check if email already belongs to a group (optional MVP constraint)
    existing = find_existing_group_for_email(email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already belongs to a group. One email can only be in one group."
        )
    
    # Create the group
    group = create_group(
        name=req.name.strip(),
        daily_limit_minutes=req.daily_limit_minutes,
        creator_email=email
    )
    
    return {
        "group_id": group["id"],
        "group_code": group["invite_code"],
        "name": group["name"],
        "daily_limit_minutes": group["daily_limit_minutes"],
    }


@app.get("/groups/{email}")
def get_user_groups(email: str):
    """
    Get all groups for a specific email address.
    Returns array of group info.
    """
    groups = get_groups_for_email(email)
    
    return [
        {
            "group_id": g["id"],
            "group_name": g.get("name"),
            "daily_limit_minutes": g.get("daily_limit_minutes"),
            "invite_code": g.get("invite_code"),
        }
        for g in groups
    ]


@app.get("/group/{group_code}")
def get_group_by_code(group_code: str):
    """
    Get basic group info by invite code.
    Useful for validating invite codes before joining.
    """
    group = get_group_by_invite_code(group_code.strip())
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    return {
        "group_id": group["id"],
        "name": group.get("name"),
        "daily_limit_minutes": group.get("daily_limit_minutes"),
        "invite_code": group.get("invite_code"),
    }
