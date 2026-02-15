// import React, { useState } from 'react';

// const UserProfile = () => {
//     // EDIT: call FastAPI to fetch personal user stats
//     const [userStats] = useState({
//         username: "Survivor_One",
//         streak: 7,
//         totalFocus: "42h",
//         apps: [
//             { id: 1, name: 'Instagram', used: 45, limit: 30 },
//             { id: 2, name: 'YouTube', used: 20, limit: 60 }
//         ]
//     });

//     return (
//         <div className="profile-container">
//             <div className="card" style={{ textAlign: 'center' }}>
//                 <div style={{ fontSize: '3rem' }}>🛡️</div>
//                 <h2>{userStats.username}</h2>
//                 <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
//                     <div><strong>🔥 Streak:</strong> {userStats.streak} Days</div>
//                     <div><strong>⌛ Focus:</strong> {userStats.totalFocus}</div>
//                 </div>
//             </div>

//             <div className="card">
//                 <h3>📱 My App Barriers</h3>
//                 {userStats.apps.map(app => {
//                     const isOver = app.used > app.limit;
//                     const pct = Math.min((app.used / app.limit) * 100, 100);
                    
//                     return (
//                         <div key={app.id} style={{ marginBottom: '15px' }}>
//                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
//                                 <span>{app.name}</span>
//                                 <span style={{ color: isOver ? 'var(--color-zombie-red)' : 'inherit' }}>
//                                     {app.used} / {app.limit} min
//                                 </span>
//                             </div>
//                             <div style={{ width: '100%', height: '10px', backgroundColor: '#eee', borderRadius: '5px' }}>
//                                 <div style={{ 
//                                     width: `${pct}%`, 
//                                     height: '100%', 
//                                     backgroundColor: isOver ? 'var(--color-zombie-red)' : 'var(--color-zombie-green)',
//                                     borderRadius: '5px',
//                                     transition: 'width 0.5s ease'
//                                 }} />
//                             </div>
//                         </div>
//                     );
//                 })}
//                 {/* EDIT: Add "Add App" button logic here */}
//             </div>
//         </div>
//     );
// };

// export default UserProfile;

import React, { useMemo, useState } from "react";

export default function UserProfile() {
  // Mock profile (replace later with Supabase/profile table)
  const [profile] = useState({
    username: "Demo User",
    castle_health: 85,
    total_procrastination_minutes: 120,
    streak: 4,
  });

  const level = useMemo(() => Math.floor((profile.streak * 10 + (100 - profile.total_procrastination_minutes / 10)) / 10), [profile]);

  return (
    <div className="stack">
      <div className="headerRow">
        <div>
          <div className="kicker">Profile</div>
          <h1 className="h1">{profile.username}</h1>
          <div className="sub">Your stats (simple MVP)</div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardTop">
            <div>
              <div className="cardTitle">🏰 Castle Health</div>
              <div className="muted">How strong you’re holding up.</div>
            </div>
            <div className="pill">{profile.castle_health}%</div>
          </div>

          <div className="bar big">
            <div className="barFill" style={{ width: `${profile.castle_health}%` }} />
          </div>
          <div className="tiny" style={{ marginTop: 6 }}>
            {profile.castle_health}/100
          </div>
        </div>

        <div className="card">
          <div className="cardTop">
            <div>
              <div className="cardTitle">🔥 Streak</div>
              <div className="muted">Days you stayed under your limits.</div>
            </div>
            <div className="pill">{profile.streak} days</div>
          </div>

          <div className="bigStat">{level}</div>
          <div className="tiny muted">“Discipline level” (fake metric for now)</div>
        </div>

        <div className="card span2">
          <div className="cardTop">
            <div>
              <div className="cardTitle">⏱️ Total Procrastination</div>
              <div className="muted">Minutes logged from “bad apps”.</div>
            </div>
            <div className="pill">{profile.total_procrastination_minutes}m</div>
          </div>

          <div className="note">
            Later: fetch this from FastAPI + screentime aggregation.
          </div>
        </div>
      </div>
    </div>
  );
}
