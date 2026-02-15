// import React, { useState } from 'react';
// import ZombieCastle from './ZombieCastle';

// const Groups = () => {
//     // EDIT: call FastAPI to get group health and members
//     const [groupData] = useState({
//         name: "Anti-Procrastination Squad",
//         health: 85,
//         members: [
//             { name: "Alice", contribution: "+10" },
//             { name: "Bob", contribution: "-5" },
//             { name: "You", contribution: "+15" }
//         ],
//         zombies: [{ id: 1, x: 100, type: 'normal' }]
//     });

//     return (
//         <div className="groups-view">
//             <ZombieCastle castleHealth={groupData.health} zombies={groupData.zombies} />
            
//             <div className="card">
//                 <h3>Squad Members</h3>
//                 {groupData.members.map((m, i) => (
//                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-beige)' }}>
//                         <span>👤 {m.name}</span>
//                         <span style={{ color: m.contribution.includes('+') ? 'green' : 'red' }}>
//                             {m.contribution} HP
//                         </span>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Groups;

import React, { useMemo, useState } from "react";
import CastleDiorama from "./CastleDiorama";


/**
 * ✅ BACKEND PLACEHOLDER
 * Later:
 * const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
 * fetch(`${API_URL}/...`)
 */
const API_URL = "PUT_FASTAPI_URL_HERE";

// src/Groups.jsx
import React, { useMemo, useState } from "react";
import CastleDiorama from "./CastleDiorama";

/**
 * ✅ BACKEND PLACEHOLDER (recommended)
 * 1) Create a .env file in your frontend root:
 *    VITE_API_URL=http://127.0.0.1:8000
 *
 * 2) Then this will auto-pick it up:
 */
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Groups() {
  const [groupName] = useState("Anti-Procrastination Squad");
  const [castleHealth, setCastleHealth] = useState(85);

  const [members] = useState([
    { id: 1, name: "Alice", initial: "A", status: "Grinding" },
    { id: 2, name: "Bob", initial: "B", status: "Doomscrolling" },
    { id: 3, name: "Charlie", initial: "C", status: "Offline" },
  ]);

  const [apps, setApps] = useState([
    { id: 1, name: "Instagram", limit: 30, used: 45 },
    { id: 2, name: "TikTok", limit: 60, used: 20 },
  ]);

  const [newAppName, setNewAppName] = useState("");
  const [newAppLimit, setNewAppLimit] = useState(30);

  const totalUsed = useMemo(() => apps.reduce((s, a) => s + a.used, 0), [apps]);
  const totalLimit = useMemo(() => apps.reduce((s, a) => s + a.limit, 0), [apps]);

  const overallPct = Math.min(
    100,
    Math.round((totalUsed / Math.max(1, totalLimit)) * 100)
  );

  function addApp(e) {
    e.preventDefault();
    const name = newAppName.trim();
    if (!name) return;

    setApps((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        limit: Math.max(5, Number(newAppLimit) || 30),
        used: 0,
      },
    ]);

    setNewAppName("");
    setNewAppLimit(30);

    // Later: POST to backend
    // fetch(`${API_URL}/apps`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ name, limit: Number(newAppLimit) || 30 }),
    // });
  }

  function removeApp(id) {
    setApps((prev) => prev.filter((a) => a.id !== id));
  }

  function setLimit(id, next) {
    setApps((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, limit: Math.max(5, Number(next) || 5) } : a
      )
    );
  }

  function quickDamage() {
    // demo button: castle loses hp when you "doomscroll"
    setCastleHealth((h) => Math.max(0, h - 5));
  }

  return (
    <div className="stack">
      <div className="headerRow">
        <div>
          <div className="kicker">Group</div>
          <h1 className="h1">{groupName}</h1>
          <div className="sub">
            Backend hook later: <code>{API_URL}</code>
          </div>
        </div>

        <div className="actions">
          <button className="btnGhost" onClick={() => alert("Invite flow later")}>
            + Invite
          </button>
          <button className="btn" onClick={quickDamage}>
            Simulate Doomscroll (-5 HP)
          </button>
        </div>
      </div>

      <div className="grid2">
        {/* ✅ Castle (NEW: image crossfade diorama) */}
        <section className="card">
          <CastleDiorama
            hp={castleHealth}
            maxHp={100}
            title="🏰 Group Castle"
            subtitle="Breaks down as procrastination increases"
          />
        </section>

        {/* Members */}
        <section className="card">
          <div className="cardTop">
            <div>
              <div className="cardTitle">👥 Squad Members</div>
              <div className="muted">{members.length} members</div>
            </div>
            <button
              className="btnGhostSmall"
              onClick={() => alert("Add member later")}
            >
              + Invite
            </button>
          </div>

          <div className="memberList">
            {members.map((m) => (
              <div key={m.id} className="memberRow">
                <div className="avatar">{m.initial}</div>
                <div className="memberMeta">
                  <div className="memberName">{m.name}</div>
                  <div className="memberStatus">
                    <span className={`dot ${m.status.toLowerCase()}`} />
                    <span className="tiny">{m.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Apps */}
        <section className="card span2">
          <div className="cardTop">
            <div>
              <div className="cardTitle">📱 Apps & Time Limits</div>
              <div className="muted">Set limits, watch the bar fill up.</div>
            </div>
            <div className="pill">
              Total: {totalUsed}m / {totalLimit}m
            </div>
          </div>

          <div className="bar big">
            <div className="barFill" style={{ width: `${overallPct}%` }} />
          </div>
          <div className="tiny" style={{ marginTop: 6 }}>
            Overall usage: {overallPct}%
          </div>

          <form className="addRow" onSubmit={addApp}>
            <input
              className="input"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              placeholder="App name (e.g. Instagram)"
            />
            <input
              className="inputSmall"
              type="number"
              min={5}
              value={newAppLimit}
              onChange={(e) => setNewAppLimit(e.target.value)}
              placeholder="Limit"
            />
            <button className="btn" type="submit">
              + Add
            </button>
          </form>

          <div className="appList">
            {apps.map((app) => {
              const pct = Math.min(
                100,
                Math.round((app.used / Math.max(1, app.limit)) * 100)
              );
              const over = app.used > app.limit;

              return (
                <div key={app.id} className="appRow">
                  <div className="appLeft">
                    <div className="appName">{app.name}</div>
                    <div className="tiny muted">
                      Used {app.used}m • Limit {app.limit}m{" "}
                      {over ? "• over" : ""}
                    </div>
                  </div>

                  <div className="appMid">
                    <div className="bar">
                      <div
                        className="barFill"
                        style={{
                          width: `${pct}%`,
                          background: over ? "var(--danger)" : "var(--good)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="appRight">
                    <input
                      className="inputTiny"
                      type="number"
                      min={5}
                      value={app.limit}
                      onChange={(e) => setLimit(app.id, e.target.value)}
                    />
                    <button
                      className="btnGhostSmall"
                      onClick={() => removeApp(app.id)}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
