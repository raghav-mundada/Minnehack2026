# Castle Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Castle Frontend                    │
│           (React + Vite + Router)               │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │                                          │  │
│  │  Landing Page  →  Create / Join / List  │  │
│  │                                          │  │
│  │              ↓                           │  │
│  │                                          │  │
│  │         Group Dashboard                  │  │
│  │    (Health, Streak, Leaderboard)         │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                      ↓                          │
│              API Client (fetch)                 │
│                                                 │
└─────────────────────────────────────────────────┘
                       ↓
                   HTTP/JSON
                       ↓
┌─────────────────────────────────────────────────┐
│                                                 │
│            FastAPI Backend                      │
│                                                 │
│  ✅ POST   /join-group                          │
│  ✅ GET    /groups/{id}/status                  │
│  ✅ GET    /groups/{id}/streak                  │
│  ✅ GET    /leaderboard                         │
│  ✅ POST   /ingest                              │
│  ⚠️  POST   /create-group        (MISSING)      │
│  ⚠️  GET    /groups/{email}      (MISSING)      │
│                                                 │
└─────────────────────────────────────────────────┘
                       ↓
                   Supabase
                       ↓
┌─────────────────────────────────────────────────┐
│                                                 │
│              PostgreSQL Database                │
│                                                 │
│  Tables:                                        │
│  ├─ groups                                      │
│  │   └─ id, name, daily_limit, invite_code     │
│  ├─ group_members                               │
│  │   └─ group_id, email                        │
│  └─ usage_logs                                  │
│      └─ group_id, email, date, app, minutes    │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Data Flow

### Creating a Group
```
User → Create Group Page
  ↓
Enter: name, limit, email
  ↓
POST /create-group
  ↓
Backend generates invite_code
  ↓
Insert into groups table
  ↓
Insert creator into group_members
  ↓
Return: group_id, invite_code
  ↓
Show invite code to user
```

### Joining a Group
```
User → Join Group Page (or /join/{code})
  ↓
Enter: invite_code, email
  ↓
POST /join-group
  ↓
Backend validates code
  ↓
Insert into group_members
  ↓
Return: group info
  ↓
Navigate to Dashboard
```

### Viewing Dashboard
```
User → Group Dashboard
  ↓
Parallel requests:
  ├─ GET /groups/{id}/status
  │   ↓
  │   Query usage_logs for today
  │   ↓
  │   Calculate: used/limit, health%, alive?
  │   ↓
  │   Return member totals
  │
  └─ GET /groups/{id}/streak
      ↓
      Query usage_logs for last 90 days
      ↓
      Count consecutive survived days
      ↓
      Return streak count
  ↓
Display:
- Castle status (alive/broken)
- Health percentage
- Progress bars
- Streak counter
- Member leaderboard
```

### Ingesting Usage
```
User submits screen time
  ↓
POST /ingest
  ↓
Body: {
  email,
  log_date,
  usage_blob: "Instagram (45m)\nYouTube (1h 30m)"
}
  ↓
Backend parses usage_blob
  ↓
Extract app names and durations
  ↓
Insert into usage_logs
  ↓
Return: inserted_rows count
```

## Frontend Routes

```
/                   Landing Page
/create             Create Group Page
/join               Join Group Page (enter code)
/join/:groupCode    Join Group Page (code prefilled)
/my-groups          My Groups Page (list all)
/group/:groupId     Group Dashboard
```

## Key Components

### API Client (`src/api/client.js`)
- Centralized fetch() wrapper
- Error handling
- JSON serialization
- Base URL from env

### Pages
- **LandingPage**: Entry point with 3 buttons
- **CreateGroupPage**: Form + success with invite code
- **JoinGroupPage**: Form with optional URL param
- **MyGroupsPage**: Email input → list of groups
- **GroupDashboard**: Main view with all stats

### Styling
- Global CSS with CSS variables
- Apple-inspired design system
- Responsive mobile-first
- Component-specific CSS files

## Environment Configuration

```env
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8000

# Backend (.env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

## Development Workflow

```
1. Start Backend
   → cd backend
   → uvicorn main:app --reload

2. Start Frontend
   → cd castle-frontend
   → npm run dev

3. Test Flow
   → Open http://localhost:5173
   → Create group (after implementing endpoint)
   → Copy invite code
   → Join group in new tab
   → View dashboard
```

## Technology Stack

**Frontend:**
- React 18
- React Router 6
- Vite 5
- Vanilla CSS (no frameworks)

**Backend:**
- FastAPI
- Supabase (PostgreSQL)
- Python 3.9+

**Deployment:**
- Frontend: Vercel / Netlify / Cloudflare Pages
- Backend: Railway / Render / Fly.io
- Database: Supabase (managed)

## Status Legend

✅ **Implemented & Working**
- Join group flow
- Group dashboard
- Streak tracking
- Status/health display

⚠️ **Needs Implementation**
- Create group endpoint
- Get user groups endpoint

🎯 **Ready to Deploy**
- Frontend code complete
- Design polished
- Documentation ready
- Just needs 2 backend endpoints!
