# Deployment Guide

## Quick Start

Your application is now configured to run as a single FastAPI server that serves both the API and frontend!

### 1. Set up Environment Variables

Edit `.env` and add your Supabase credentials:
```bash
SUPABASE_URL=https://your-project.supabase.co  
SUPABASE_SERVICE_KEY=your-service-key-here
```

### 2. Run the Server

```bash
uvicorn main:app --reload --port 8000
```

### 3. Open in Browser

Navigate to: **http://localhost:8000**

That's it! The FastAPI server now serves:
- **Frontend**: http://localhost:8000 (React app)
- **API**: http://localhost:8000/api/* (all backend endpoints)

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Get access token

### Users
- `GET /api/users/me` - Get current user profile

### Groups
- `POST /api/groups/create` - Create group
- `POST /api/groups/join` - Join group
- `GET /api/groups/my-group` - Get user's current group
- `GET /api/groups/{group_id}/status` - Get castle health
- `GET /api/leaderboard` - Global leaderboard

### Activity
- `POST /api/activity/log` - Log procrastination
- `POST /api/ingest` - Ingest screen time data

---

## Production Deployment

For production, you can deploy to:

### Railway / Render / Fly.io
1. Push code to GitHub
2. Connect your repo
3. Set environment variables in the dashboard
4. Deploy!

### Docker (Optional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t anti-procrastination .
docker run -p 8000:8000 --env-file .env anti-procrastination
```

---

## File Structure

```
Minnehack2026/
├── main.py                 # FastAPI app (serves both API + frontend)
├── schemas.py              # Pydantic models
├── supabase_client.py      # Supabase connection
├── config.py               # Environment config
├── .env                    # Your credentials (DO NOT COMMIT)
├── requirements.txt        # Python dependencies
│
├── services/               # Backend logic
│   ├── group_service.py
│   ├── leaderboard_service.py
│   └── ...
│
└── src/                    # React frontend (no build needed!)
    ├── index.html          # Entry point
    ├── App.jsx             # Main app component
    ├── Groups.jsx          # Groups view
    ├── UserProfile.jsx     # User profile
    ├── CreateGroup.jsx     # Group creation
    └── styles/
        └── theme.css       # Styles
```

---

## Notes

- **No build step required!** The frontend uses CDN React and Babel transpiler
- All API routes are prefixed with `/api`
- Frontend is served directly from the `src/` directory
- Perfect for rapid development and simple deployment
