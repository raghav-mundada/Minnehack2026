# Castle Frontend

A minimalist, mobile-first React frontend for the Castle screen time challenge app.

## 🏰 Features

- **Landing Page**: Entry point with options to create/join groups
- **Create Group**: Set up a new castle with daily limits
- **Join Group**: Join existing groups via invite code or link
- **My Groups**: View all groups you're part of
- **Group Dashboard**: Real-time castle health, streak tracking, and member leaderboard

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (FastAPI server)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your backend URL
# VITE_API_BASE_URL=http://localhost:8000

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
castle-frontend/
├── src/
│   ├── api/
│   │   └── client.js          # API client (all fetch calls)
│   ├── pages/
│   │   ├── LandingPage.jsx    # Home page
│   │   ├── CreateGroupPage.jsx
│   │   ├── JoinGroupPage.jsx
│   │   ├── MyGroupsPage.jsx
│   │   └── GroupDashboard.jsx # Main dashboard
│   ├── App.jsx                # Router setup
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
└── .env
```

## 🔌 Backend API Requirements

The frontend expects these endpoints from your FastAPI backend:

### ✅ Implemented (Already in your backend)

- `POST /join-group` - Join a group via invite code
- `GET /groups/{group_id}/status` - Get group status (health, usage, members)
- `GET /groups/{group_id}/streak` - Get current group streak
- `GET /leaderboard` - Global leaderboard
- `POST /ingest` - Submit usage data

### ⚠️ Missing (Need to implement in backend)

#### 1. Create Group
```python
@app.post("/create-group")
def create_group(req: CreateGroupRequest):
    # CreateGroupRequest: name, daily_limit_minutes, creator_email
    # Generate unique invite_code
    # Create group in DB
    # Add creator as first member
    # Return: group_id, group_code, name, daily_limit_minutes
```

#### 2. Get Groups for Email
```python
@app.get("/groups/{email}")
def get_user_groups(email: str):
    # Find all groups where email is a member
    # Return: [{ group_id, group_name, daily_limit_minutes, invite_code }]
```

### API Response Examples

**POST /join-group** (Already works)
```json
{
  "group_id": "uuid-here",
  "group_name": "Weekend Warriors",
  "daily_limit_minutes": 120
}
```

**GET /groups/{group_id}/status** (Already works)
```json
{
  "group_id": "uuid",
  "date": "2024-02-15",
  "limit_minutes": 120,
  "used_minutes": 45,
  "health_percent": 62,
  "alive": true,
  "members": [
    { "email": "user@example.com", "total_minutes": 45 }
  ]
}
```

**GET /groups/{group_id}/streak** (Already works)
```json
{
  "group_id": "uuid",
  "group_name": "Weekend Warriors",
  "current_streak_days": 5,
  "lookback_days": 90
}
```

## 🎨 Design Philosophy

- **Apple-inspired minimalism**: Clean, soft shadows, rounded corners
- **Mobile-first**: Optimized for iPhone-like viewports (max-width: 480px)
- **No heavy animations**: Subtle transitions only
- **Clear hierarchy**: Typography and spacing guide the user
- **Accessible**: Semantic HTML, proper labels, keyboard navigation

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

For production, update this to your deployed backend URL.

### CORS Setup (Backend)

Make sure your FastAPI backend has CORS enabled:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🐛 Troubleshooting

### Backend Endpoints Not Found

Some endpoints are not yet implemented in your backend:
- `/create-group` - Implement this to enable group creation
- `/groups/{email}` - Implement this to enable "My Groups" page

The frontend will show error messages indicating which endpoints need to be added.

### CORS Errors

Add your frontend URL to the CORS allowed origins in your FastAPI backend.

### API Connection Issues

Check that `VITE_API_BASE_URL` in `.env` matches your backend URL.

## 📱 User Flow

1. **Landing Page** → Choose action
2. **Create Group** → Get invite code → Share with friends
3. **Join Group** → Enter code → Redirected to dashboard
4. **My Groups** → View all groups → Click to open dashboard
5. **Group Dashboard** → See health, streak, member usage

## 🎯 Key Features

- **Castle Health**: Visual representation of how close to limit
- **Streak Tracking**: Consecutive days of staying under limit
- **Member Leaderboard**: See who's using the most time
- **Real-time Updates**: Refresh button to get latest data
- **Invite Sharing**: Copy invite links to clipboard
- **Email Persistence**: Saves email to localStorage for convenience

## 📝 Notes

- The app assumes one email can only be in one group (enforced by backend)
- All times are displayed in hours and minutes format
- Health percentage goes from 100% (no usage) to 0% (at limit)
- Castle "breaks" when total usage >= daily limit

## 🚧 Future Enhancements

- Push notifications for castle status
- Historical graphs of usage over time
- Group chat or comments
- Custom castle icons/themes
- Export usage reports
- Social sharing of streaks

## 📄 License

MIT
