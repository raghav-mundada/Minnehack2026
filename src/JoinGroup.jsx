import React, { useState } from "react";

export default function JoinGroup({ onJoined }) {
    const [inviteCode, setInviteCode] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/join-group", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    invite_code: inviteCode.trim().toUpperCase(),
                    email: email.trim().toLowerCase()
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to join group");
            }

            const data = await response.json();
            onJoined(inviteCode.trim().toUpperCase());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="authPage">
            <div className="authCard">
                <div className="authHeader">
                    <div className="logo">🏰</div>
                    <h1 className="h1" style={{
                        fontSize: '28px',
                        marginTop: '16px',
                        marginBottom: '8px'
                    }}>
                        Brainrot Defender
                    </h1>
                    <p className="sub" style={{
                        fontSize: '14px',
                        color: 'var(--primary-bright)',
                        fontWeight: 600,
                        letterSpacing: '1px'
                    }}>
                        Mending &gt; Ending
                    </p>
                </div>

                <form className="authForm" onSubmit={handleSubmit}>
                    <h2 className="h2">Join a Group</h2>

                    {error && (
                        <div className="alert alertError">
                            {error}
                        </div>
                    )}

                    <div className="formGroup">
                        <label htmlFor="email" className="label">Your Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="formGroup">
                        <label htmlFor="inviteCode" className="label">
                            Invite Code
                        </label>
                        <input
                            id="inviteCode"
                            type="text"
                            className="input"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            placeholder="ABC123"
                            required
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                letterSpacing: "0.1em",
                                textAlign: "center"
                            }}
                            maxLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btnPrimary btnFull"
                        disabled={loading || inviteCode.length < 6}
                        style={{
                            opacity: (loading || inviteCode.length < 6) ? 0.7 : 1,
                            cursor: (loading || inviteCode.length < 6) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.25s ease'
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span style={{
                                    display: 'inline-block',
                                    width: '14px',
                                    height: '14px',
                                    border: '2px solid white',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }} />
                                Joining...
                            </span>
                        ) : "Join Group"}
                    </button>
                </form>
            </div>
        </div>
    );
}
