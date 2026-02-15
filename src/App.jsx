// // Inside your App.jsx render function, use this mapping:
// const renderView = () => {
//   switch (currentView) {
//     case 'groups': return <Groups />;
//     case 'leaderboard': return <Leaderboard />;
//     case 'profile': return <UserProfile />;
//     case 'create-group': return <CreateGroup />;
//     default: return <Groups />;
//   }
// };

import React, { useState } from "react";
import Groups from "./Groups.jsx";
import CreateGroup from "./CreateGroup.jsx";
import UserProfile from "./UserProfile.jsx";

export default function App() {
  const [view, setView] = useState("groups");

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="logo">🏰</div>
          <div>
            <div className="kicker">Mending &gt; Ending</div>
            <div className="title">Brainrot Defender</div>
          </div>
        </div>

        <nav className="tabs">
          <button className={`tab ${view === "groups" ? "active" : ""}`} onClick={() => setView("groups")}>
            Groups
          </button>
          <button className={`tab ${view === "profile" ? "active" : ""}`} onClick={() => setView("profile")}>
            Profile
          </button>
          <button className={`tab ${view === "create" ? "active" : ""}`} onClick={() => setView("create")}>
            + New Group
          </button>
        </nav>
      </header>

      <main className="container">
        {view === "groups" && <Groups />}
        {view === "profile" && <UserProfile />}
        {view === "create" && <CreateGroup onCreated={() => setView("groups")} />}
      </main>
    </div>
  );
}
