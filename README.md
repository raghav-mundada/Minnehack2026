# Brainrot Defender 🏰

A gamified screen time management app that helps you fight procrastination with friends!

## Features

- 🏰 **Castle Defense**: Your group's castle health decreases when you exceed time limits
- 🧟 **Zombie System**: Procrastination spawns zombies that attack your castle
- 👥 **Group Accountability**: Join groups with friends to defend together
- 📊 **Leaderboard**: See how your group members are doing
- ⏱️ **Screen Time Tracking**: Upload your screen time data to track progress
- 🎯 **Personal Stats**: Track your streak, level, and procrastination time

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Expo

```bash
npm start
```

This will start the Expo development server and show a QR code.

### 3. Run on Your Phone

1. Install **Expo Go** on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code:
   - iOS: Use the Camera app
   - Android: Use the Expo Go app

## Project Structure

```
├── mobile/                 # Mobile app source code
│   ├── App.js             # Main app component with navigation
│   ├── screens/           # All app screens
│   │   ├── GroupsScreen.js
│   │   ├── ProfileScreen.js
│   │   └── JoinGroupScreen.js
│   ├── services/          # API and services
│   │   └── api.js
│   └── styles/            # Styles and theme
│       └── theme.js
├── app/                   # FastAPI backend (Python)
│   ├── main.py
│   ├── routers/
│   └── core/
└── src/                   # Web frontend (React)
```

## Backend Setup (Optional)

The app currently works in demo mode. To connect to a real backend:

1. **Update API URL** in `mobile/services/api.js`:
   ```javascript
   const API_URL = 'YOUR_BACKEND_URL'; // e.g., ngrok URL or local network IP
   ```

2. **Start the FastAPI backend**:
   ```bash
   cd app
   pip install -r ../requirements.txt
   uvicorn main:app --reload
   ```

3. **For mobile testing**, use ngrok to expose your local server:
   ```bash
   ngrok http 8000
   ```

## How to Use

### Join a Group

1. Tap "Join/Create" in the bottom navigation
2. Enter your email
3. Enter a group code (or create a new group)
4. Start defending your castle!

### Track Screen Time

**iOS:**
1. Settings → Screen Time → See All Activity
2. Copy your app usage data
3. Upload in the app

**Android:**
1. Settings → Digital Wellbeing → Dashboard
2. Copy your app usage data
3. Upload in the app

## Tech Stack

- **Mobile**: React Native + Expo
- **Backend**: FastAPI + Python
- **Database**: Supabase
- **Storage**: AsyncStorage (mobile)
- **State**: React Hooks

## Color Scheme

The app uses a warm brown aesthetic:
- Background: `#faf8f5` (warm off-white)
- Primary: `#8d6e63` (warm brown)
- Text: `#3e2723` (dark brown)
- Success: `#558b2f` (green)
- Danger: `#c62828` (red)

## Contributing

Feel free to submit issues and pull requests!

## License

MIT
