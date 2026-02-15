# Backend Endpoints Required

This document lists all the endpoints the frontend expects, with implementation status and examples.

## ✅ Already Implemented

### 1. POST /join-group
Join an existing group using an invite code.

**Request:**
```json
{
  "invite_code": "ABC123",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "group_id": "uuid-here",
  "group_name": "Weekend Warriors",
  "daily_limit_minutes": 120
}
```

**Status:** ✅ Working

---

### 2. GET /groups/{group_id}/status
Get the current status of a group for today (or specified date).

**Query Params:**
- `date` (optional): ISO date string (YYYY-MM-DD)

**Response:**
```json
{
  "group_id": "uuid",
  "date": "2024-02-15",
  "limit_minutes": 120,
  "used_minutes": 45,
  "health_percent": 62,
  "alive": true,
  "members": [
    {
      "email": "user@example.com",
      "total_minutes": 45
    }
  ]
}
```

**Status:** ✅ Working

---

### 3. GET /groups/{group_id}/streak
Get the current streak for a group.

**Query Params:**
- `lookback_days` (optional, default: 90): How far back to look

**Response:**
```json
{
  "group_id": "uuid",
  "group_name": "Weekend Warriors",
  "current_streak_days": 5,
  "lookback_days": 90
}
```

**Status:** ✅ Working

---

### 4. GET /leaderboard
Get global leaderboard of all groups.

**Query Params:**
- `top` (optional, default: 10): Number of groups to return
- `lookback_days` (optional, default: 90): Lookback period

**Response:**
```json
{
  "top": 10,
  "lookback_days": 90,
  "leaderboard": [
    {
      "group_id": "uuid",
      "group_name": "Champions",
      "current_streak_days": 15
    }
  ]
}
```

**Status:** ✅ Working

---

### 5. POST /ingest
Submit screen time usage data.

**Request:**
```json
{
  "email": "user@example.com",
  "log_date": "2024-02-15",
  "usage_blob": "Instagram (45m)\nYouTube (1h 30m)"
}
```

**Response:**
```json
{
  "inserted_rows": 2
}
```

**Status:** ✅ Working

---

## ⚠️ NEED TO IMPLEMENT

### 6. POST /create-group
Create a new group and return the invite code.

**Suggested Implementation:**

```python
from pydantic import BaseModel
import uuid
import secrets

class CreateGroupRequest(BaseModel):
    name: str
    daily_limit_minutes: int
    creator_email: str

@app.post("/create-group")
def create_group(req: CreateGroupRequest):
    # Generate unique invite code (6-8 alphanumeric)
    invite_code = secrets.token_urlsafe(6).upper()[:8]
    
    # Create group in database
    group_id = str(uuid.uuid4())
    
    # Insert into groups table
    supabase.table("groups").insert({
        "id": group_id,
        "name": req.name,
        "daily_limit_minutes": req.daily_limit_minutes,
        "invite_code": invite_code,
        "created_at": "now()"
    }).execute()
    
    # Add creator as first member
    supabase.table("group_members").insert({
        "group_id": group_id,
        "email": req.creator_email.lower().strip()
    }).execute()
    
    return {
        "group_id": group_id,
        "group_code": invite_code,  # or "invite_code": invite_code
        "name": req.name,
        "daily_limit_minutes": req.daily_limit_minutes
    }
```

**Expected Response:**
```json
{
  "group_id": "uuid-here",
  "group_code": "ABC123XY",
  "name": "Weekend Warriors",
  "daily_limit_minutes": 120
}
```

**Status:** ⚠️ NOT IMPLEMENTED

---

### 7. GET /groups/{email}
Get all groups for a specific email address.

**Suggested Implementation:**

```python
@app.get("/groups/{email}")
def get_user_groups(email: str):
    # Get all group memberships
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
    
    return [
        {
            "group_id": g["id"],
            "group_name": g["name"],
            "daily_limit_minutes": g["daily_limit_minutes"],
            "invite_code": g["invite_code"]
        }
        for g in (groups.data or [])
    ]
```

**Expected Response:**
```json
[
  {
    "group_id": "uuid-1",
    "group_name": "Weekend Warriors",
    "daily_limit_minutes": 120,
    "invite_code": "ABC123"
  },
  {
    "group_id": "uuid-2",
    "group_name": "Study Group",
    "daily_limit_minutes": 180,
    "invite_code": "XYZ789"
  }
]
```

**Status:** ⚠️ NOT IMPLEMENTED

---

## 📝 Database Schema Requirements

Make sure your Supabase tables have these columns:

### groups
```sql
- id (uuid, primary key)
- name (text)
- daily_limit_minutes (integer)
- invite_code (text, unique)
- created_at (timestamp)
```

### group_members
```sql
- group_id (uuid, foreign key -> groups.id)
- email (text)
- joined_at (timestamp)
- PRIMARY KEY (group_id, email)  -- composite key for upsert
```

### usage_logs
```sql
- id (uuid, primary key)
- group_id (uuid, foreign key -> groups.id)
- email (text)
- log_date (date)
- app (text)
- minutes (integer)
- source_key (text, unique)
- created_at (timestamp)
```

---

## 🔧 Testing the Missing Endpoints

Once you implement `/create-group` and `/groups/{email}`, test them:

### Test Create Group
```bash
curl -X POST http://localhost:8000/create-group \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Group",
    "daily_limit_minutes": 120,
    "creator_email": "test@example.com"
  }'
```

### Test Get User Groups
```bash
curl http://localhost:8000/groups/test@example.com
```

---

## 🚀 Quick Backend Setup

Add these to your `main.py`:

```python
# Add to imports
from pydantic import BaseModel
import secrets

# Add model
class CreateGroupRequest(BaseModel):
    name: str
    daily_limit_minutes: int
    creator_email: str

# Add endpoints (see implementations above)
```

After adding these endpoints, the frontend will work completely!
