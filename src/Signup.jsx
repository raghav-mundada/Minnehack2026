import React, { useState } from "react";

export default function Signup({ onSignup, onSwitchToLogin }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 🔌 BACKEND: POST /api/auth/signup
            // Send: { username, email, password }
            // Receive: { message, user_id }
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Signup failed");
            }

            // Auto-login after signup
            const loginResponse = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!loginResponse.ok) {
                throw new Error("Account created! Please login.");
            }

            const loginData = await loginResponse.json();
            localStorage.setItem("token", loginData.access_token);
            onSignup(loginData.access_token);
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
                    <h2 className="h2">Create Account</h2>

                    {error && (
                        <div className="alert alertError">
                            {error}
                        </div>
                    )}

                    <div className="formGroup">
                        <label htmlFor="username" className="label">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your name"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="formGroup">
                        <label htmlFor="email" className="label">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="formGroup">
                        <label htmlFor="password" className="label">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                        <p className="tiny muted" style={{ marginTop: 4 }}>
                            At least 6 characters
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="btn btnPrimary btnFull"
                        disabled={loading}
                        style={{
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
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
                                Creating account...
                            </span>
                        ) : "Sign Up"}
                    </button>

                    <div className="authFooter">
                        <p className="tiny muted">
                            Already have an account?{" "}
                            <button
                                type="button"
                                className="linkButton"
                                onClick={onSwitchToLogin}
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
