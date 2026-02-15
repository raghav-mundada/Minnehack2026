// // import React, { useState } from 'react';

// // const CreateGroup = () => {
// //     const [name, setName] = useState('');
// //     const [inviteCode, setInviteCode] = useState('');

// //     const handleCreate = async (e) => {
// //         e.preventDefault();
// //         // EDIT: call FastAPI to POST new group
// //         // const response = await fetch('http://localhost:8000/groups/create', { method: 'POST', ... });
// //         // const data = await response.json();
        
// //         const mockCode = Math.random().toString(36).substring(2, 7).toUpperCase();
// //         setInviteCode(mockCode);
// //     };

// //     return (
// //         <div className="card">
// //             <h2>🛡️ Found a New Squad</h2>
// //             <p>Every great fortress starts with a name and a few brave souls.</p>
            
// //             {!inviteCode ? (
// //                 <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
// //                     <input 
// //                         type="text" 
// //                         placeholder="Squad Name (e.g., The Iron Wall)" 
// //                         value={name}
// //                         onChange={(e) => setName(e.target.value)}
// //                         required
// //                     />
// //                     <button type="submit">Create Fortress</button>
// //                 </form>
// //             ) : (
// //                 <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--color-beige)', borderRadius: '8px' }}>
// //                     <h3>Group Created!</h3>
// //                     <p>Share this code with your friends:</p>
// //                     <h1 style={{ letterSpacing: '5px', color: 'var(--color-brown-dark)' }}>{inviteCode}</h1>
// //                     <button onClick={() => setInviteCode('')}>Done</button>
// //                 </div>
// //             )}
// //         </div>
// //     );
// // };

// // export default CreateGroup;

// import React, { useState } from "react";

// const API_URL = "PUT_FASTAPI_URL_HERE";

// export default function CreateGroup({ onCreated }) {
//   const [name, setName] = useState("");
//   const [invite, setInvite] = useState("");

//   function create() {
//     const g = name.trim();
//     if (!g) return;

//     // Demo: generate invite
//     const code = Math.random().toString(36).slice(2, 8).toUpperCase();
//     setInvite(code);

//     // Later: POST backend
//     // fetch(`${API_URL}/groups`, { method:"POST", body: JSON.stringify({name:g}) })

//     onCreated?.();
//   }

//   return (
//     <div className="stack">
//       <div className="headerRow">
//         <div>
//           <div className="kicker">Create</div>
//           <h1 className="h1">New Group</h1>
//           <div className="sub">
//             Backend hook later: <code>{API_URL}</code>
//           </div>
//         </div>
//       </div>

//       <div className="card">
//         <div className="cardTitle">🧠 Create your squad</div>
//         <div className="muted">Make a group, invite friends, defend together.</div>

//         <div className="stack" style={{ marginTop: 12 }}>
//           <label className="label">Group name</label>
//           <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Code Warriors" />

//           <button className="btn" onClick={create}>Create Group</button>

//           {invite ? (
//             <div className="inviteBox">
//               <div className="muted">Invite code</div>
//               <div className="inviteCode">{invite}</div>
//               <button className="btnGhostSmall" onClick={() => navigator.clipboard.writeText(invite)}>
//                 Copy
//               </button>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { apiPost } from "./api";

export default function CreateGroup({ onCreated }) {
  const [email, setEmail] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function joinGroup() {
    const e = email.trim();
    const code = groupCode.trim().toUpperCase();
    if (!e || !code) return alert("Enter email + group code");

    try {
      setLoading(true);

      // ✅ THIS MATCHES YOUR SCREENSHOT:
      // POST { email, group_code } -> /join-group
      const data = await apiPost("/join-group", {
        email: e,
        group_code: code,
      });

      alert("Joined group!");
      onCreated?.(data); // optional (you can use response)
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createGroup() {
    // optional endpoint if you have one
    // POST { email } -> /create-group
    // If you don't have create-group yet, ignore this button.
    const e = email.trim();
    if (!e) return alert("Enter email");

    try {
      setLoading(true);
      const data = await apiPost("/create-group", { email: e });
      alert(`Group created! Code: ${data.group_code || "CHECK RESPONSE"}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <div className="headerRow">
        <div>
          <div className="kicker">Groups</div>
          <h1 className="h1">Join a Group</h1>
          <div className="sub">Uses your ngrok URL from <code>.env</code></div>
        </div>
      </div>

      <div className="card">
        <div className="cardTitle">Enter details</div>
        <div className="muted">We’ll call <code>/join-group</code> on your backend.</div>

        <div className="stack" style={{ marginTop: 12 }}>
          <label className="label">Email</label>
          <input
            className="input"
            placeholder="archit@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label">Group Code</label>
          <input
            className="input"
            placeholder="ABC123"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn" onClick={joinGroup} disabled={loading}>
              {loading ? "Joining..." : "Join Group"}
            </button>

            <button className="btnGhost" onClick={createGroup} disabled={loading}>
              {loading ? "..." : "Create Group (optional)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
