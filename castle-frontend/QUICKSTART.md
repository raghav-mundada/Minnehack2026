# 🏰 Castle Frontend - Quick Start Guide

## 🚀 Get Running in 3 Minutes

### Step 1: Install Dependencies
```bash
cd castle-frontend
npm install
```

### Step 2: Configure Backend URL
```bash
# The .env file is already created with:
# VITE_API_BASE_URL=http://localhost:8000

# Edit if your backend runs on a different port
```

### Step 3: Start Development Server
```bash
npm run dev
```

Open your browser to `http://localhost:5173` 🎉

---

## ⚠️ Important: Backend Setup Required

Two endpoints are **NOT YET IMPLEMENTED** in your backend:

1. **POST /create-group** - For creating new groups
2. **GET /groups/{email}** - For viewing user's groups

### Quick Fix (Add to your FastAPI main.py):

```python
from pydantic import BaseModel
import secrets

class CreateGroupRequest(BaseModel):
    name: str
    daily_limit_minutes: int
    creator_email: str

@app.post("/create-group")
def create_group(req: CreateGroupRequest):
    import uuid
    invite_code = secrets.token_urlsafe(6).upper()[:8]
    group_id = str(uuid.uuid4())
    
    supabase.table("groups").insert({
        "id": group_id,
        "name": req.name,
        "daily_limit_minutes": req.daily_limit_minutes,
        "invite_code": invite_code
    }).execute()
    
    supabase.table("group_members").insert({
        "group_id": group_id,
        "email": req.creator_email.lower().strip()
    }).execute()
    
    return {
        "group_id": group_id,
        "group_code": invite_code,
        "name": req.name,
        "daily_limit_minutes": req.daily_limit_minutes
    }

@app.get("/groups/{email}")
def get_user_groups(email: str):
    memberships = supabase.table("group_members") \
        .select("group_id") \
        .eq("email", email.lower().strip()) \
        .execute()
    
    if not memberships.data:
        return []
    
    group_ids = [m["group_id"] for m in memberships.data]
    groups = supabase.table("groups") \
        .select("id,name,daily_limit_minutes,invite_code") \
        .in_("id", group_ids) \
        .execute()
    
    return [{
        "group_id": g["id"],
        "group_name": g["name"],
        "daily_limit_minutes": g["daily_limit_minutes"],
        "invite_code": g["invite_code"]
    } for g in (groups.data or [])]
```

Full details in `BACKEND_ENDPOINTS.md`

---

## 📱 What's Included

### Pages
- ✅ Landing page with 3 action buttons
- ✅ Create group flow (needs backend endpoint)
- ✅ Join group flow (working!)
- ✅ My groups list (needs backend endpoint)
- ✅ Group dashboard (working!)

### Features
- 🏰 Real-time castle health visualization
- 🔥 Streak tracking
- 👥 Member usage leaderboard
- 📊 Progress bars with color coding
- 📋 Copy invite link to clipboard
- 💾 Email persistence in localStorage

### Design
- 🎨 Apple-inspired minimalist UI
- 📱 Mobile-first (max-width: 480px)
- ✨ Subtle animations and transitions
- 🎯 Clear visual hierarchy
- ♿ Accessible and semantic HTML

---

## 🔧 Project Structure

```
castle-frontend/
├── src/
│   ├── api/client.js          # All API calls
│   ├── pages/                 # Page components
│   ├── App.jsx                # Router
│   ├── main.jsx               # Entry
│   └── index.css              # Global styles
├── public/
│   └── castle.svg             # Favicon
├── .env                       # Backend URL config
├── package.json
└── README.md
```

---

## 🐛 Troubleshooting

### "Failed to fetch groups"
→ Backend endpoint `/groups/{email}` not implemented yet

### "Failed to create group"
→ Backend endpoint `/create-group` not implemented yet

### CORS errors
→ Add CORS middleware to FastAPI:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Join group works! Dashboard works!
→ These use existing backend endpoints ✅

---

## 📝 Next Steps

1. ✅ Get frontend running
2. ⚠️ Implement 2 missing backend endpoints
3. ✅ Test full flow: create → join → dashboard
4. 🚀 Deploy to production
5. 🎉 Challenge your friends!

---

## 🎯 User Flow

```
Landing Page
    ↓
    ├─→ Create Group → Share invite code
    ├─→ Join Group → Enter code → Dashboard
    └─→ My Groups → List → Click → Dashboard

Dashboard shows:
- Castle alive/broken status
- Health percentage
- Usage vs limit
- Streak counter
- Member leaderboard
```

---

## 💡 Tips

- The app saves your email in localStorage for convenience
- Invite links work: `/join/ABC123`
- Health bar changes color: green → yellow → red
- Castle emoji changes when broken: 🏰 → 💥
- Refresh button updates all data

---

## 📚 Documentation

- `README.md` - Full documentation
- `BACKEND_ENDPOINTS.md` - API requirements
- `QUICKSTART.md` - This guide!

---

**Built with ❤️ for your hackathon. Good luck!** 🏰
