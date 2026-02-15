import React, { useState } from "react";

export default function Login({ onLogin, onSwitchToSignup }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Login failed");
            }

            const data = await response.json();

            localStorage.setItem("token", data.access_token);


            onLogin(data.access_token);
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
                    <h2 className="h2">Welcome Back</h2>

                    {error && (
                        <div className="alert alertError">
                            {error}
                        </div>
                    )}

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
                            autoComplete="current-password"
                        />
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
                                Signing in...
                            </span>
                        ) : "Sign In"}
                    </button>

                    <div className="authFooter">
                        <p className="tiny muted">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                className="linkButton"
                                onClick={onSwitchToSignup}
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
